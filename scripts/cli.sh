#!/usr/bin/env sh

# Requirements: Git, jq, curl

# Login (user / pass)

# SWAGGER UI API https://eu-gb.appid.cloud.ibm.com/swagger-ui/#/Profiles%20-%20Attributes/profiles.getAllAttributesUsingGET

management_register_new_user(){
  curl -X POST "$MANAGEMENT_URL/cloud_directory/sign_up?shouldCreateProfile=true&language=en" \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d '{
      "active": true,
      "emails": [
        {
          "value": "'$USER_EMAIL'",
          "primary": true
        }
      ],
      "userName": "'$USER_NAME'",
      "password": "'$USER_PASSWORD'"
      }'

}

get_management_access_token(){
    curl -S -s -o -X POST https://iam.cloud.ibm.com/identity/token  \
       -H 'Content-Type: application/x-www-form-urlencoded' \
       -H 'Accept: application/json' \
       -d "apikey=${IAM_AT}" \
       -d "grant_type=urn:ibm:params:oauth:grant-type:apikey" \
       | jq -r .access_token

}


get_access_token(){
    curl --http1.0 -X POST $OAUTH_SERVER_URL/token \
       -H 'Content-Type: application/x-www-form-urlencoded' \
       -H 'Accept: application/json' \
       -u $CLIENT_ID:$SECRET \
       -d "grant_type=password&username=$USER_EMAIL&password=$USER_PASSWORD" \
       | jq -r .access_token
}

get_user_id(){
  curl -X 'GET' \
  $OAUTH_SERVER_URL/userinfo \
  -H 'accept: application/json' \
  -H "X-IBM-Client-Id: $USER_ACCESS_TOKEN" \
  | jq -r .sub

}




# 1- Generate ssh key, store it locally, configure ssh config**, and send it along with project settings upon initialization
# 2- Create project and set deploy key (FaaS)
# 3- Init git repo

#**#Host eu-de.git.cloud.ibm.com
#  PreferredAuthentications publickey
#  IdentityFile ~/.ssh/id_ed25519
init_local_git_repo(){
    mkdir .das && cd .das/
    git init
    git remote add das git@eu-de.git.cloud.ibm.com:/davidmonras/${existing_project_id}.git
}


trap_logs_to_file(){
  exec 3>&1 4>&2
  trap 'exec 2>&4 1>&3' 0 1 2 3
  exec 1>log.out 2>&1
}


post_job_state(){
  TIMESTAMP=$(echo '('`date +"%s.%N"` ' * 1000000)/1' | bc)
  curl -X PUT "$CLOUDANT_SERVICE_URL/jobs/$PIPELINE_RUN_ID:$USER_ID:$JOB_ID:$TIMESTAMP" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "_id":"'$PIPELINE_RUN_ID':'$USER_ID':'$JOB_ID':'$TIMESTAMP'",
      "userId": "'$USER_ID'",
      "pipelineRunId": "'$PIPELINE_RUN_ID'",
      "startDate": 1287128222,
      "state": "'$2'",
      "message": {
          "type":"log",
          "jobStep": "'$1'",
          "text":"",
          "timestamp": "'$TIMESTAMP'"
      },
      "deployUrl":"https://www.testdeployurl.tests"
    }'


}

get_all_user_jobs(){
  curl -X POST $CLOUDANT_SERVICE_URL/jobs/_partition/$USER_ID/_find \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H 'Accept: application/json' \
    -d '{
      "selector": {
        
      },
      "limit": 100
    }'

}

get_all_user_running_jobs(){
  curl -X POST $CLOUDANT_SERVICE_URL/jobs/_partition/$USER_ID/_find \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H 'Accept: application/json' \
    -d '{
      "selector": {
        "state":"running"
      },
      "limit": 100
    }'

}

create_query_pipeline_index(){
  curl -X POST $CLOUDANT_SERVICE_URL/jobs/_index \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H 'Accept: application/json' \
    -d '{
        "index": { 
          "fields": [
            "timestamp"
           ] 
        } 
      }'
}

get_all_pipeline_run_id_messages(){
  curl -X POST $CLOUDANT_SERVICE_URL/jobs/_partition/$PIPELINE_RUN_ID/_find \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H 'Accept: application/json' \
    -d '{
      "selector": {
        
      },
      "fields": [
        "state",
        "message"
      ],
      "sort": [
        "pipelineRunId",
        "timestamp"
      ],
      "limit": 100
    }'

}

get_job_deploy_url(){
  curl -X GET $CLOUDANT_SERVICE_URL/jobs/$USER_ID:$JOB_ID \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
  | jq -r .deployUrl
}

post_payload(){
  curl -X PUT $CLOUDANT_SERVICE_URL/jobs/$1 \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "$PAYLOAD"
}

test(){
  PAYLOAD='{
    "foo":"bar
    }'

  curl -XPOST https://webhook.site/14caacca-9f9b-43b4-9661-1f4fa86cdaf8 -d "$PAYLOAD" -d @$1
}


#Pipeline log GET https://pipeline-ui.eu-de.devops.cloud.ibm.com/devops/pipelines/api/v1/pipelines/26aeb88a-4ac9-4d28-83eb-0a2c138d3861
#Bearer auth
# Vars

OAUTH_SERVER_URL=https://eu-gb.appid.cloud.ibm.com/oauth/v4/ab9ad070-69fd-4d80-b244-83233dab0ec8   
MANAGEMENT_URL=https://eu-gb.appid.cloud.ibm.com/management/v4/ab9ad070-69fd-4d80-b244-83233dab0ec8
CLIENT_ID=0d643592-aee5-4068-8c54-c18e7c6ca42c
SECRET=Mzk4MzUwYzUtMWU3Ny00YWFkLTlkNWQtNjRlYzJjMGVlN2Jh
IAM_AT=80xHAC3FTXMrPY8T8IK4jDin6nJNUC2Lp0khGIZGcpyQ
CLOUDANT_SERVICE_URL=https://a0eef20d-a88d-41cc-a2b2-b54f00d95d92-bluemix.cloudantnosqldb.appdomain.cloud

# SIGN UP + LOGIN process
# Open URL in browser
# Follow OAUTH FLOW: Configure redirect uri for localhost:9101/oauth/callback?code=xxx&state=yyy
# SUCCESS -> code (token endpoint -- access / identity token) / state (random string -- verification)
# FAILURE --> error / state
SIGN_IN_URL=https://eu-gb.appid.cloud.ibm.com/oauth/v4/ab9ad070-69fd-4d80-b244-83233dab0ec8/authorization?response_type=code&client_id=0d643592-aee5-4068-8c54-c18e7c6ca42c&redirect_uri=https%3A%2F%2Feu-gb.appid.cloud.ibm.com%2F&scope=openid
SIGN_UP_URL=https://eu-gb.appid.cloud.ibm.com/oauth/v4/ab9ad070-69fd-4d80-b244-83233dab0ec8/authorization?response_type=sign_up&client_id=0d643592-aee5-4068-8c54-c18e7c6ca42c&redirect_uri=https%3A%2F%2Feu-gb.appid.cloud.ibm.com%2F&scope=openid

USER_EMAIL=obtjpvlrvrufyvwiqe@tbbyt.net
USER_NAME=daviddavid
USER_PASSWORD=p4ssw0rd

#--Get userid--#

#USER_ACCESS_TOKEN=$(get_access_token)
#USER_ID=$(get_user_id)
#echo "USERID: $USER_ID"

#--Create/Update Document--#

#post_job_state "running" "1"
#post_job_state "done" "1"
#post_job_state "running" "2"
#post_job_state "done" "2"
#get_all_pipeline_run_id_messages
#--Fetch all jobs for a userId--#
ACCESS_TOKEN=$(get_management_access_token)
echo "$ACCESS_TOKEN"
#USER_ID=101
#get_all_user_jobs












