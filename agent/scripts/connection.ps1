param (
    [Parameter(Mandatory = $true)]
    [string] $ApiKey
)

$ApiKeySecureString = $ApiKey | ConvertTo-SecureString
$ApiKeyBSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($ApiKeySecureString)
$ApiKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ApiKeyBSTR)

$ApiKey = @{
    "Api-Key" = $ApiKey
}

$ApiKey | ConvertTo-Json -Compress