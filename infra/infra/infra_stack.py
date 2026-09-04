from aws_cdk import (
    CfnOutput,
    Duration,
    RemovalPolicy,
    Stack,
)
from aws_cdk import (
    aws_apigatewayv2 as apigwv2,
)
from aws_cdk import (
    aws_apigatewayv2_integrations as apigwv2_integrations,
)
from aws_cdk import (
    aws_certificatemanager as acm,
)
from aws_cdk import (
    aws_cloudfront as cloudfront,
)
from aws_cdk import (
    aws_cloudfront_origins as origins,
)
from aws_cdk import (
    aws_iam as iam,
)
from aws_cdk import (
    aws_lambda as lambda_,
)
from aws_cdk import (
    aws_route53 as route53,
)
from aws_cdk import (
    aws_route53_targets as route53_targets,
)
from aws_cdk import (
    aws_s3 as s3,
)
from constructs import Construct

CONTACT_TO_EMAIL = "jacobotero0313@gmail.com"
# SES starts in sandbox mode, so the "From" address must be a verified
# identity too. Using the same address keeps setup to a single verification.
CONTACT_FROM_EMAIL = CONTACT_TO_EMAIL

LOCAL_DEV_ORIGINS = ["http://localhost:5173", "http://localhost:5184"]

DOMAIN_NAME = "jacobotero.dev"
WWW_DOMAIN_NAME = f"www.{DOMAIN_NAME}"

# GitHub's OIDC "sub" claim embeds the numeric owner/repo IDs
# (repo:<owner>@<ownerId>/<repo>@<repoId>:...) rather than plain names, as an
# anti-hijack measure against renames. Confirmed via a real failed
# AssumeRoleWithWebIdentity call in CloudTrail before this was fixed.
GITHUB_REPO_SUBJECT_PREFIX = "repo:jacobotero@145607571/portfolio-website@1355388222:"


class InfraStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        site_bucket = s3.Bucket(
            self,
            "SiteBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            encryption=s3.BucketEncryption.S3_MANAGED,
            removal_policy=RemovalPolicy.RETAIN,
        )

        hosted_zone = route53.HostedZone.from_lookup(
            self, "HostedZone", domain_name=DOMAIN_NAME
        )

        # CloudFront requires the certificate in us-east-1; this stack is
        # already deployed there, so no cross-region setup is needed.
        certificate = acm.Certificate(
            self,
            "SiteCertificate",
            domain_name=DOMAIN_NAME,
            subject_alternative_names=[WWW_DOMAIN_NAME],
            validation=acm.CertificateValidation.from_dns(hosted_zone),
        )

        distribution = cloudfront.Distribution(
            self,
            "SiteDistribution",
            default_root_object="index.html",
            domain_names=[DOMAIN_NAME, WWW_DOMAIN_NAME],
            certificate=certificate,
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                response_headers_policy=cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
            ),
            # Single-page app: unknown paths fall back to index.html.
            # Single-page app: unknown paths fall back to index.html so
            # client-side routes survive a direct hit or a refresh.
            #
            # Both codes are required. S3 behind Origin Access Control answers
            # a missing key with 403 AccessDenied, not 404 — the bucket policy
            # grants s3:GetObject but not s3:ListBucket, so S3 will not confirm
            # whether the object exists. Mapping only 404 leaves every deep
            # link returning an XML AccessDenied page.
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
            ],
        )

        cf_target = route53.RecordTarget.from_alias(route53_targets.CloudFrontTarget(distribution))
        route53.ARecord(
            self, "ApexAliasRecord", zone=hosted_zone, target=cf_target
        )
        route53.AaaaRecord(
            self, "ApexAliasRecordV6", zone=hosted_zone, target=cf_target
        )
        route53.ARecord(
            self,
            "WwwAliasRecord",
            zone=hosted_zone,
            record_name=WWW_DOMAIN_NAME,
            target=cf_target,
        )
        route53.AaaaRecord(
            self,
            "WwwAliasRecordV6",
            zone=hosted_zone,
            record_name=WWW_DOMAIN_NAME,
            target=cf_target,
        )

        site_origin = f"https://{DOMAIN_NAME}"
        cloudfront_default_origin = f"https://{distribution.distribution_domain_name}"

        contact_fn = lambda_.Function(
            self,
            "ContactFunction",
            runtime=lambda_.Runtime.PYTHON_3_13,
            handler="handler.handler",
            code=lambda_.Code.from_asset("lambda/contact"),
            timeout=Duration.seconds(10),
            environment={
                "TO_EMAIL": CONTACT_TO_EMAIL,
                "FROM_EMAIL": CONTACT_FROM_EMAIL,
            },
        )
        contact_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["ses:SendEmail", "ses:SendRawEmail"],
                # Scoped to the one verified identity this Lambda actually
                # sends as, rather than every identity in the account.
                resources=[
                    f"arn:aws:ses:{self.region}:{self.account}:identity/{CONTACT_FROM_EMAIL}"
                ],
            )
        )

        http_api = apigwv2.HttpApi(
            self,
            "ContactApi",
            cors_preflight=apigwv2.CorsPreflightOptions(
                allow_origins=[
                    site_origin,
                    f"https://{WWW_DOMAIN_NAME}",
                    cloudfront_default_origin,
                    *LOCAL_DEV_ORIGINS,
                ],
                allow_methods=[apigwv2.CorsHttpMethod.POST],
                allow_headers=["content-type"],
            ),
        )
        # A human can't legitimately submit this form faster than a few
        # times a second; this blunts a spam/abuse script without affecting
        # real visitors. Set via the L1 escape hatch on the auto-created
        # default stage — creating a second stage for "$default" conflicts
        # with API Gateway's one-stage-per-name constraint.
        default_stage_cfn = http_api.default_stage.node.default_child
        default_stage_cfn.default_route_settings = apigwv2.CfnStage.RouteSettingsProperty(
            throttling_rate_limit=5,
            throttling_burst_limit=10,
        )
        http_api.add_routes(
            path="/contact",
            methods=[apigwv2.HttpMethod.POST],
            integration=apigwv2_integrations.HttpLambdaIntegration(
                "ContactIntegration", contact_fn
            ),
        )

        # GitHub Actions deploys via OIDC federation instead of long-lived
        # access keys: CI assumes this role using a short-lived web identity
        # token, scoped to this one repo.
        github_provider = iam.OpenIdConnectProvider(
            self,
            "GithubOidcProvider",
            url="https://token.actions.githubusercontent.com",
            client_ids=["sts.amazonaws.com"],
        )

        deploy_role = iam.Role(
            self,
            "GithubActionsDeployRole",
            assumed_by=iam.WebIdentityPrincipal(
                github_provider.open_id_connect_provider_arn,
                conditions={
                    "StringEquals": {
                        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                    },
                    "StringLike": {
                        "token.actions.githubusercontent.com:sub": f"{GITHUB_REPO_SUBJECT_PREFIX}*",
                    },
                },
            ),
            description="Assumed by GitHub Actions to deploy the portfolio site",
        )

        site_bucket.grant_read_write(deploy_role)
        site_bucket.grant_delete(deploy_role)
        deploy_role.add_to_policy(
            iam.PolicyStatement(
                actions=["cloudfront:CreateInvalidation"],
                resources=[distribution.distribution_arn],
            )
        )
        # Needed only for the infra workflow's `cdk deploy` — it assumes the
        # CDK bootstrap roles rather than acting on resources directly.
        deploy_role.add_to_policy(
            iam.PolicyStatement(
                actions=["sts:AssumeRole"],
                resources=[f"arn:aws:iam::{self.account}:role/cdk-*-{self.account}-{self.region}"],
            )
        )
        deploy_role.add_to_policy(
            iam.PolicyStatement(
                actions=["ssm:GetParameter"],
                resources=[f"arn:aws:ssm:{self.region}:{self.account}:parameter/cdk-bootstrap/*"],
            )
        )

        CfnOutput(self, "SiteBucketName", value=site_bucket.bucket_name)
        CfnOutput(self, "DistributionId", value=distribution.distribution_id)
        CfnOutput(self, "SiteUrl", value=site_origin)
        CfnOutput(self, "CloudFrontDefaultUrl", value=cloudfront_default_origin)
        CfnOutput(self, "ContactApiUrl", value=f"{http_api.api_endpoint}/contact")
        CfnOutput(self, "GithubActionsRoleArn", value=deploy_role.role_arn)
