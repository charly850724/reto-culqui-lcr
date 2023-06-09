import type { AWS } from "@serverless/typescript";

import functions from "./serverless/functions";
import dynamoResources from "./serverless/dynamoResources";

const serverlessConfiguration: AWS = {
    service: "lcr-simulator",
    frameworkVersion: "3",
    plugins: ["serverless-esbuild"],
    provider: {
        name: "aws",
        runtime: "nodejs16.x",
        region: "us-west-2",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
            myTable: "${self:custom.myTable}",
        },
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: "dynamodb:*",
                Resource: [
                    "arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${self:custom.myTable}",
                ],
            },
        ],
    },
    // import the function via paths
    functions,
    resources: {
        Resources: {
            ...dynamoResources,
        },
    },
    package: { individually: true },
    custom: {
        myTable: "${sls:stage}-lcr-output-table",

        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ["aws-sdk"],
            target: "node16",
            define: { "require.resolve": undefined },
            platform: "node",
            concurrency: 10,
        },
    },
};

module.exports = serverlessConfiguration;