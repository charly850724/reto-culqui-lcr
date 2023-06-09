import type { AWS } from "@serverless/typescript";

const dynamoResources: AWS["resources"]["Resources"] = {
    myTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
            TableName: "${self:custom.myTable}",
            AttributeDefinitions: [
                {
                    AttributeName: "id",
                    AttributeType: "S",
                },
            ],
            KeySchema: [
                {
                    AttributeName: "id",
                    KeyType: "HASH",
                },
            ],
            BillingMode: "PAY_PER_REQUEST",

            StreamSpecification: {
                StreamViewType: "NEW_AND_OLD_IMAGES",
            },
        },
    },
};

export default dynamoResources;