$ProgressPreference = "SilentlyContinue"
$HostName = hostname
$Processes = Get-Process | Select-Object @{Name = "name"; Expr = { $_.ProcessName } }, @{Name = "pId"; Expr = { [string]$_.Id } }                          
$Domain = (Get-WmiObject Win32_ComputerSystem).Domain
$Services = Get-Service | Select-Object @{Name = "displayName"; Expr = { $_.DisplayName } }, @{Name = "status"; Expr = { $_.Status } } | ConvertTo-Csv | ConvertFrom-Csv                                                                    
$OSDetails = Get-CimInstance Win32_OperatingSystem
$Drives = Get-PSDrive -PSProvider FileSystem | Select-Object @{Name = "name"; Expr = { $_.Name } }, @{Name = "usedGb"; Expr = { [math]::Round($_.Used / 1GB, 2) } }, @{Name = "freeGb"; Expr = { [math]::Round($_.Free / 1GB, 2) } } | ConvertTo-Csv | ConvertFrom-Csv                              
$SerialNumber = Get-CimInstance win32_bios
$Applications = Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
Where-Object { $_.DisplayName -ne $null } |
Select-Object @{Name = "name"; Expr = { $_.DisplayName } }, @{Name = "version"; Expr = { $_.DisplayVersion } }      
$MakeModel = Get-CimInstance Win32_ComputerSystemProduct

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
}

$computerProperties | ConvertTo-Json -Compress