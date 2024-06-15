import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';

export class MyBlogStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for the static website
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    // Deploy static files to S3
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../frontend')],
      destinationBucket: siteBucket,
    });

    // VPC for RDS
    const vpc = new ec2.Vpc(this, 'MyBlogVPC');

    // RDS instance
    const dbInstance = new rds.DatabaseInstance(this, 'MyBlogDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12_4,
      }),
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromGeneratedSecret('dbadmin'),
      databaseName: 'blog',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function for fetching posts
    const fetchPostsFunction = new lambda.Function(this, 'FetchPostsFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'fetchPosts.handler',
      code: lambda.Code.fromAsset('../backend'),
      environment: {
        DB_HOST: dbInstance.dbInstanceEndpointAddress,
        DB_USER: 'dbadmin',
        DB_PASSWORD: 'password', // replace with actual password or secret
        DB_NAME: 'blog',
      },
      vpc,
    });

    // Lambda function for adding a post
    const addPostFunction = new lambda.Function(this, 'AddPostFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'addPost.handler',
      code: lambda.Code.fromAsset('../backend'),
      environment: {
        DB_HOST: dbInstance.dbInstanceEndpointAddress,
        DB_USER: 'dbadmin',
        DB_PASSWORD: 'password', // replace with actual password or secret
        DB_NAME: 'blog',
      },
      vpc,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'MyBlogApi', {
      restApiName: 'My Blog Service',
      description: 'This service serves blog posts.',
    });

    const posts = api.root.addResource('posts');
    const getAllIntegration = new apigateway.LambdaIntegration(fetchPostsFunction);
    posts.addMethod('GET', getAllIntegration);

    const addPostIntegration = new apigateway.LambdaIntegration(addPostFunction);
    posts.addMethod('POST', addPostIntegration);

    // Output the S3 URL and API URL
    new cdk.CfnOutput(this, 'SiteURL', {
      value: siteBucket.bucketWebsiteUrl,
    });

    new cdk.CfnOutput(this, 'ApiURL', {
      value: api.url,
    });
  }
}
