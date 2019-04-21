#Requires -RunAsAdministrator
param (
    [Parameter(Mandatory = $true)]
    [string] $ManagementNode
)
$InstallDirectory = "C:\pwshMgr\Agent"
$HostName = hostname
$UUID     = (gcim -Class Win32_ComputerSystemProduct).UUID
$RegisterData = @{
    'name'  = $HostName
    'uuid'  = $UUID
} | ConvertTo-Json
$parameters = @{
    Uri             = "$ManagementNode/api/register"
    Method          = "Post"
    Body            = $RegisterData
    UseBasicParsing = $True
    ContentType     = "application/json"
}
$RegisterResponse = (wget @parameters).Content | ConvertFrom-Json
# Add database path to .env file
$DotEnv = "ID=$($RegisterResponse._id)" +
"`r`nMANAGEMENT_NODE=$ManagementNode" +
"`r`nAPI_KEY=$($RegisterResponse.apiKey)" |
    Out-File -Encoding ascii -NoClobber $InstallDirectory\.env -NoNewline