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
    aws_s3 as s3,
)
from constructs import Construct

CONTACT_TO_EMAIL = "jacobotero0313@gmail.com"
# SES starts in sandbox mode, so the "From" address must be a verified
# identity too. Using the same address keeps setup to a single verification.
CONTACT_FROM_EMAIL = CONTACT_TO_EMAIL

LOCAL_DEV_ORIGINS = ["http://localhost:5173", "http://localhost:5184"]


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

        distribution = cloudfront.Distribution(
            self,
            "SiteDistribution",
            default_root_object="index.html",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            # Single-page app: unknown paths fall back to index.html.
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
            ],
        )

        site_origin = f"https://{distribution.distribution_domain_name}"

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
                resources=["*"],
            )
        )

        http_api = apigwv2.HttpApi(
            self,
            "ContactApi",
            cors_preflight=apigwv2.CorsPreflightOptions(
                allow_origins=[site_origin, *LOCAL_DEV_ORIGINS],
                allow_methods=[apigwv2.CorsHttpMethod.POST],
                allow_headers=["content-type"],
            ),
        )
        http_api.add_routes(
            path="/contact",
            methods=[apigwv2.HttpMethod.POST],
            integration=apigwv2_integrations.HttpLambdaIntegration(
                "ContactIntegration", contact_fn
            ),
        )

        CfnOutput(self, "SiteBucketName", value=site_bucket.bucket_name)
        CfnOutput(self, "DistributionId", value=distribution.distribution_id)
        CfnOutput(self, "SiteUrl", value=site_origin)
        CfnOutput(self, "ContactApiUrl", value=f"{http_api.api_endpoint}/contact")
