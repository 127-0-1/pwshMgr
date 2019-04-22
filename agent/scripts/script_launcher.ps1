param (
    [Parameter()]
    $ApiKey,

    [Parameter()]
    $MachineID,

    [Parameter()]
    $ManagementNode
)

function ConvertTo-ScriptBlock {
    param ([string]$string)
    $scriptblock = $executioncontext.invokecommand.NewScriptBlock($string)
    return $scriptblock
}

$Scripts = (wget -Uri "$ManagementNode/api/agent/jobs/machine/$MachineID").Content | ConvertFrom-Json