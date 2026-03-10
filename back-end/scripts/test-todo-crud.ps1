param(
  [string]$BaseUrl = "http://127.0.0.1:8787"
)

$ErrorActionPreference = "Stop"

$imagePath = Join-Path $PSScriptRoot "..\test-data\todo-sample.svg"
$imageBytes = [IO.File]::ReadAllBytes($imagePath)
$imageBase64 = [Convert]::ToBase64String($imageBytes)

$createBody = @{
  title = "Backend todo test"
  description = "Created by scripts/test-todo-crud.ps1"
  isCompleted = $false
  imageFileName = "todo-sample.svg"
  imageContentType = "image/svg+xml"
  imageBase64 = $imageBase64
} | ConvertTo-Json -Compress

$created = Invoke-RestMethod `
  -Uri "$BaseUrl/api/todos" `
  -Method Post `
  -ContentType "application/json" `
  -Body $createBody

$id = $created.item.id

Write-Host "Created todo id:" $id
Write-Host ($created | ConvertTo-Json -Depth 6)

$list = Invoke-RestMethod -Uri "$BaseUrl/api/todos" -Method Get
Write-Host "Todo count after create:" $list.items.Count

$single = Invoke-RestMethod -Uri "$BaseUrl/api/todos/$id" -Method Get
Write-Host "Fetched single todo title:" $single.item.title

$imageResponse = Invoke-WebRequest `
  -Uri "$BaseUrl/api/todos/$id/image" `
  -Method Get `
  -UseBasicParsing

Write-Host "Fetched image bytes:" $imageResponse.RawContentLength

$updateBody = @{
  title = "Backend todo updated"
  description = "Updated by scripts/test-todo-crud.ps1"
  isCompleted = $true
} | ConvertTo-Json -Compress

$updated = Invoke-RestMethod `
  -Uri "$BaseUrl/api/todos/$id" `
  -Method Put `
  -ContentType "application/json" `
  -Body $updateBody

Write-Host "Updated todo completed flag:" $updated.item.is_completed

$deleted = Invoke-RestMethod -Uri "$BaseUrl/api/todos/$id" -Method Delete
Write-Host ($deleted | ConvertTo-Json -Depth 4)

$afterDelete = Invoke-RestMethod -Uri "$BaseUrl/api/todos" -Method Get
Write-Host "Todo count after delete:" $afterDelete.items.Count
