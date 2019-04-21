#Requires -RunAsAdministrator

#Input Parameters
param (
    [Parameter(Mandatory = $true)]
    [string] $ManagementNode,

    [Parameter()]
    [string] $InstallDirectory
)

$InstallDirectory = "C:\pwshMgr\Agent"
write $InstallDirectory

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
"`r`nMANAGEMENT_NODE=$ManagementNode" |
    Out-File -Encoding ascii -NoClobber $InstallDirectory\.env -NoNewline