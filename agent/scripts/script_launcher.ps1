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

$Jobs = (wget -Uri "$ManagementNode/api/agent/jobs/machine/$MachineID").Content | ConvertFrom-Json

if 

$ScriptBlock = ConvertTo-ScriptBlock -string $jobs[0].script.scriptBody

$ScriptOutput = Invoke-Command -ScriptBlock $ScriptBlock

$ScriptOutputJson = @{
    'output'            = (Out-String -InputObject $ScriptOutput)
    'jobId' = ($Jobs[0]._id)
    'status' = "Completed"
} | ConvertTo-Json

wget -Uri "$ManagementNode/api/agent/jobupdate/$MachineID" -Method Put -Body $ScriptOutputJson -ContentType "application/json"