import aws_cdk as core
import aws_cdk.assertions as assertions

from infra.infra_stack import InfraStack


def _synth_template():
    app = core.App()
    stack = InfraStack(
        app, "TestStack", env=core.Environment(account="123456789012", region="us-east-1")
    )
    return assertions.Template.from_stack(stack)


def test_site_bucket_blocks_public_access():
    template = _synth_template()
    template.has_resource_properties(
        "AWS::S3::Bucket",
        {
            "PublicAccessBlockConfiguration": {
                "BlockPublicAcls": True,
                "BlockPublicPolicy": True,
                "IgnorePublicAcls": True,
                "RestrictPublicBuckets": True,
            }
        },
    )


def test_cloudfront_distribution_created():
    template = _synth_template()
    template.resource_count_is("AWS::CloudFront::Distribution", 1)


def test_contact_lambda_created_with_expected_env():
    template = _synth_template()
    template.has_resource_properties(
        "AWS::Lambda::Function",
        {
            "Handler": "handler.handler",
            "Runtime": "python3.13",
        },
    )


def test_http_api_created():
    template = _synth_template()
    template.resource_count_is("AWS::ApiGatewayV2::Api", 1)
