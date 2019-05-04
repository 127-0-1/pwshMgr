param (
    [Parameter(Mandatory = $true)]
    $ApiKey,

    [Parameter(Mandatory = $true)]
    $MachineID,

    [Parameter(Mandatory = $true)]
    $ManagementNode
)

Start-Sleep -Seconds 30

function ConvertTo-ScriptBlock {
    param ([string]$Script)
    $scriptblock = $executioncontext.invokecommand.NewScriptBlock($string)
    return $scriptblock
}

$RunningJobs = (wget -Uri "$ManagementNode/api/agent/jobs/machine/$MachineID/Running").Content | ConvertFrom-Json
$ScheduledJobs = (wget -Uri "$ManagementNode/api/agent/jobs/machine/$MachineID/Scheduled").Content | ConvertFrom-Json

if (!$ScheduledJobs) {
    write "no jobs to run"
} 
ElseIf ($RunningJobs) {
    write "in progress jobs - exiting"
}
else {
    write "found jobs to process"
    foreach ($Job in $ScheduledJobs) {
        write "Job ID $($Job._id)"
        $ScriptBlock = ConvertTo-ScriptBlock -Script $job.script.scriptBody
        $SetJobToRunningData = @{
            'status' = "Running"
        } | ConvertTo-Json
        $SetJobToRunning = wget -Uri "$ManagementNode/api/agent/jobupdate/$($Job._id)" -Method Post -Body $SetJobToRunningData -ContentType "application/json"
        try {
            $ScriptOutput = Invoke-Command -ScriptBlock $ScriptBlock
        }
        catch {
            $ErrorOutput = $_
        }
        if ($ErrorOutput) {
            $JobStatus = "Failed"
            $Output = Out-String -InputObject $ErrorOutput
        }
        else {
            $JobStatus = "Completed"
            $Output = Out-String -InputObject $ScriptOutput
        }
        $ScriptOutputJson = @{
            'output' = $Output
            'status' = $JobStatus
        } | ConvertTo-Json
        
        $SendJobOutput = wget -Uri "$ManagementNode/api/agent/jobupdate/$($Job._id)" -Method Post -Body $ScriptOutputJson -ContentType "application/json"
    }
}