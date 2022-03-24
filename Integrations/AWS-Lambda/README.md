# Running Dasha in AWS Lambda

[AWS Lambda](https://aws.amazon.com/lambda) is a serverless computing platform. 
It allows you to run code without managing containers and other infrastructure objects.

The deploying code must be designed as event handler (i.e. [Lambda function](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-concepts.html#gettingstarted-concepts-function)).
After the deployment you can send events to AWS and thus trigger your handler in a proper way.

See [AWS Lambda welcome guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) for more information.

There are two general ways of interacting with AWS: via [AWS Console](https://aws.amazon.com/console) or via AWS Command Line Interface.

In the current example we are going to run simple Dasha application using AWS Lambda.

## Example description

The current example is made in the way showed in the basic AWS Lambda [blank nodejs example](https://github.com/awsdocs/aws-lambda-developer-guide/tree/main/sample-apps/blank-nodejs).
If you are not familiar with AWS Lambda, this example is a good way to dive into.

### Project files description

The AWS application is configured by `template.yml` file.
It describes all application components and combines them all together.
To learn more about AWS templates, see [AWS SAM doc](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification.html).  \
In this example the whole application is configured by `AWS::Serverless::Function` (see [AWS doc](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html) to learn its properties).  \
Please, pay attention to `AWS::Serverless::Function` properties:
- `Environment` - sets the environment variables that configure Dasha application. Here you have to provide your `Dasha apikey`, a server which will be used to run your app (for now `en` and `ru` are availabe), and application concurrency
- `Timeout` - [timeout](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html#sam-function-timeout) of application running time. The maximum possible value is `900` (sec). So, if you want to perform many calls, you have to take this limitation in mind.

The control over AWS is taken bia CLI commands wrapped in `.sh` scripts:
- `1-create-bucket.sh` - creates AWS S3 bucket
- `2-build-layer.sh` - installs `Nodejs` application dependecies and stores them into a folder. These dependencies will be used is deployment
- `3-deploy.sh` - deploys AWS application using application config `template.yml`
- `4-prepare-event.sh` - generates file `event.json` that will be used to invoke Lambda. The event structure is described in `event-template.json`
  - `"appZipBase64"` - zipped and encoded application files
  - `"conversationInputs"` - conversation inputs taken from `event-conversations.json`
- `5-invoke.sh` - uses generated event (`event.json`) to send it to the server

## Installation

1. Sign up in [DashaAI](https://dasha.ai/en-us)
2. Get `Dasha apikey` (e.g. in [Dasha CLI](https://docs.dasha.ai/en-us/default/setup-enviroment#installing-nodejs-and-dasha-cli-required3) running `dasha account info`)
3. Install AWS requirements: [instruction](https://github.com/awsdocs/aws-lambda-developer-guide/tree/main/sample-apps/blank-nodejs#requirements)

## Setup

1. Run script `1-create-bucket.sh` to create AWS bucket.  \
Example output:
```
$ ./1-create-bucket.sh 
make_bucket: lambda-artifacts-2233cac72b64eb92
```

2. Run script `2-build-layer.sh` to install dependencies and prepare them for deploying.  \
Example output:
```
$ ./2-build-layer.sh

added 249 packages, and audited 250 packages in 4s

25 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```


## Deploy

Run script `3-deploy.sh` to deploy application configured by `template.yml`.  \
Example output:
```
$ ./3-deploy.sh 

Successfully packaged artifacts and wrote output template to file out.yml.
Execute the following command to deploy the packaged template
aws cloudformation deploy --template-file C:\Users\vkuja\my\documents\dasha\rep\dasha-doc-examples\Integrations\AWS-Lambda\out.yml --stack-name <YOUR STACK NAME>

Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - dasha-aws-lambda-demo
```

## Test

Now everything is prepared for launching the application.

Our AWS application expects the events to have the following structure (see `event-template.json`):
```
{
    "body": {
        "appZipBase64": <dasha_application_files_zipped_and_encoded_with_base64>,
        "conversationInputs": <array_of_conversation_inputs>
    }
}
```

So, to test this application you have to specify conversation inputs in `event-conversations.json` file.  \
Conversation inputs are expected to be an array. Each element of the array is the conversation input that will be executed one by one.

The current dasha application needs the single parameter to start the conversation - phone number to call.

After setting up the conversation inputs, run script `4-prepare-event.sh` to prepare file with event object (`event.json`).  \
This script will zip and encode your app, parse `event-conversations.json` and combine them all together.

After that run `5-invoke.sh`. 

The first run of the app may take a few minutes: it has to be deployed on our server, the NLU dataset has to be trained, etc.  \
The further runs have to be quicker since dasha application is already cached and our server need only to get it and perform the conversation.

To see what is going on in runtime you can see AWS logs of your app:
1. open the AWS cloudwatch: https://console.aws.amazon.com/cloudwatch/
2. Navigate to `Logs`->`Log groups`
3. Choose your app. Here you can see Log groups that correspond to application invocations.
4. Choose the last log group (or what ever you want:) )
5. Explore logs

After the conversation is finished, its result (which contains `output` data, `transcription`, `recordingUrl` and time info) is stored in `out.json` and logged in your console.
