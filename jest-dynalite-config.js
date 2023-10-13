module.exports = {
  basePort: 8000,
  tables: [
    {
      // highlight-next-line
      TableName: "electro",
      KeySchema: [
        {
          // highlight-next-line
          AttributeName: "pk",
          KeyType: "HASH",
        },
        {
          // highlight-next-line
          AttributeName: "sk",
          KeyType: "RANGE",
        },
      ],
      AttributeDefinitions: [
        {
          // highlight-next-line
          AttributeName: "pk",
          AttributeType: "S",
        },
        {
          // highlight-next-line
          AttributeName: "sk",
          AttributeType: "S",
        },
        {
          // highlight-next-line
          AttributeName: "gsi1pk",
          AttributeType: "S",
        },
        {
          // highlight-next-line
          AttributeName: "gsi1sk",
          AttributeType: "S",
        },
      ],
      GlobalSecondaryIndexes: [
        {
          // highlight-next-line
          IndexName: "gsi1pk-gsi1sk-index",
          KeySchema: [
            {
              // highlight-next-line
              AttributeName: "gsi1pk",
              KeyType: "HASH",
            },
            {
              // highlight-next-line
              AttributeName: "gsi1sk",
              KeyType: "RANGE",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    },
  ],
};
