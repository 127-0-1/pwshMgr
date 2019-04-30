param (
    [Parameter()]
    $ApiKey,

    [Parameter()]
    $MachineID,

    [Parameter()]
    $ManagementNode
)

$AlertPolicies = (wget "$ManagementNode/api/alertPolicies/machine/$MachineID").Content | ConvertFrom-Json

Function New-PwshMgrAlert {
    Param(
        [Parameter(Mandatory = $true)][System.Object]$Policy,
        [Parameter(Mandatory = $true)][String]$AlertText
    )
    return $AlertBody = @{
        'name'          = $AlertText
        'machineId'     = $Policy.machineId
        'alertPolicyId' = $Policy._id
        'priority'      = $Policy.priority
    } 
}

$HostName = hostname
$Processes = Get-Process | Select-Object @{Name = "name"; Expr = { $_.ProcessName } }, @{Name = "pId"; Expr = { $_.Id } }
                                  
$Domain = (Get-WmiObject Win32_ComputerSystem).Domain
$Services = Get-Service | Select-Object @{Name = "displayName"; Expr = { $_.DisplayName } }, @{Name = "status"; Expr = { $_.Status } } | ConvertTo-Csv | ConvertFrom-Csv                                                                    
$OSDetails = Get-CimInstance Win32_OperatingSystem
$Drives = Get-PSDrive -PSProvider FileSystem | Select-Object @{Name = "name"; Expr = { $_.Name } }, @{Name = "usedGB"; Expr = { [math]::Round($_.Used / 1GB, 2) } }, @{Name = "freeGB"; Expr = { [math]::Round($_.Free / 1GB, 2) } } | ConvertTo-Csv | ConvertFrom-Csv                              
$SerialNumber = Get-CimInstance win32_bios
$Applications = Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
Where-Object { $_.DisplayName -ne $null } |
Select-Object @{Name = "name"; Expr = { $_.DisplayName } }, @{Name = "version"; Expr = { $_.DisplayVersion } }
                  
$MakeModel = Get-CimInstance Win32_ComputerSystemProduct

$Alerts = @()
foreach ($Policy in $AlertPolicies) {
    if ($Policy.type -eq "service") {
        $ServiceToCheck = $Services | Where-Object { $_.displayName -eq $Policy.item }
        if ($ServiceToCheck.status -eq "Stopped") {
            $ActiveAlerts = (wget "$ManagementNode/api/alerts/machine/$MachineID/$($Policy._id)").Content | ConvertFrom-Json
            if (!$ActiveAlerts) {
                $AlertText = """$($ServiceToCheck.displayName)"" service is stopped"
                $Alerts += New-PwshMgrAlert -Policy $Policy -AlertText $AlertText
            }
        }
    }
    if ($Policy.type -eq "drive") {
        $DriveToCheck = $Drives | Where-Object { $_.name -eq $Policy.item }
        if ([Double]$DriveToCheck.freeGB -lt [Double]$Policy.threshold) {
            $ActiveAlerts = (wget "$ManagementNode/api/alerts/machine/$MachineID/$($Policy._id)").Content | ConvertFrom-Json
            if (!$ActiveAlerts) {
                $AlertText = "$($DriveToCheck.name) drive is below $($Policy.threshold)GB. Currently $($DriveToCheck.freeGB)GB"
                $Alerts += New-PwshMgrAlert -Policy $Policy -AlertText $AlertText
            }

        }
    }
    if ($Policy.type -eq "process" -And $Policy.threshold -eq "is-running") {
        $Processes = $Processes | Select-Object name
        foreach ($Process in $Processes) {
            if ($Process.name -eq $policy.item) {
                $ActiveAlerts = (wget "$ManagementNode/api/alerts/machine/$MachineID/$($Policy._id)").Content | ConvertFrom-Json
                if (!$ActiveAlerts) {
                    $AlertText = """$($policy.item)"" process is running"
                    $Alerts += New-PwshMgrAlert -Policy $Policy -AlertText $AlertText
                }
                break
            }
        }
    }
    if ($Policy.type -eq "process" -And $Policy.threshold -eq "not-running") {
        $Processes = $Processes | Select-Object name
        foreach ($Process in $Processes) {
            if ($Process.name -eq $policy.item) {
                $running = $true 
            }
        }
        if (!$running) {
            $ActiveAlerts = (wget "$ManagementNode/api/alerts/machine/$MachineID/$($Policy._id)").Content | ConvertFrom-Json
            if (!$ActiveAlerts) {
                $AlertText = """$($policy.item)"" process is not running"
                $Alerts += New-PwshMgrAlert -Policy $Policy -AlertText $AlertText
            }
        } 
        else {
            $running = $null
        }
    }
}

$computerProperties = @{
    'name'            = $HostName
    'operatingSystem' = $osDetails.Caption
    'architecture'    = $osDetails.OSArchitecture
    'serialNumber'    = $serialnumber.SerialNumber
    'applications'    = $Applications
    'make'            = $makemodel.Vendor
    'model'           = $makemodel.Version
    'domain'          = $domain
    'services'        = $Services
    'drives'          = $Drives
    'status'          = "Online"
    'processes'       = $processes
    'alerts'          = $Alerts
    'alertPolicies'   = $AlertPolicies
}

$computerProperties | ConvertTo-Json -Compress