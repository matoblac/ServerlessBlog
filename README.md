# ServerlessBlog
ServerlessBlog is a scalable and secure blogging platform built using AWS technologies. Designed for full customization, this boilerplate project is ideal for college students and aspiring software engineers looking to enhance their resumes. With ServerlessBlog, you can easily deploy a dynamic blog leveraging AWS S3, Lambda, API Gateway, and RDS.

## Features
- Static front-end hosted on S3
- Dynamic back-end using AWS Lambda and API Gateway
- Data storage in Amazon RDS

## Prerequisites
- AWS CLI installed and configured
- AWS CDK installed
- Node.js and npm installed

## Deployment Instructions

1. **Clone the repository:**
   ```sh
   git clone https://github.com/matoblac/ServerlessBlog.git
   cd my-blog/cdk
   ```

2. **Install dependencies**
    ```sh
    npm install
    ```

3. **Bootstrap your CDK environment**
    ```sh
    cdk bootstrap
    ```

4. **Deploy the stack**
    ```sh
    cdk deploy
    ```

5. **Access your blog**
    * Website URL: The S3 bucket URL provided after deployment.
    * API URL: The API Gateway URL provided after deployment.