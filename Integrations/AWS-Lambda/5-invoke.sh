#!/bin/bash
set -eo pipefail
FUNCTION=$(aws cloudformation describe-stack-resource --stack-name dasha-aws-lambda-demo --logical-resource-id function --query 'StackResourceDetail.PhysicalResourceId' --output text)


aws lambda invoke --function-name $FUNCTION --payload file://event.json out.json
cat out.json
echo ""
sleep 2
