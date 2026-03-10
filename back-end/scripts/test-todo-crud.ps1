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

if (-not $id) {
  throw "Create todo failed: response did not include item.id"
}

Write-Host "Created todo id:" $id

$list = Invoke-RestMethod -Uri "$BaseUrl/api/todos" -Method Get
if (-not ($list.items | Where-Object { $_.id -eq $id })) {
  throw "List todos failed: created todo was not returned"
}

Write-Host "Todo count after create:" $list.items.Count

$single = Invoke-RestMethod -Uri "$BaseUrl/api/todos/$id" -Method Get
if ($single.item.id -ne $id) {
  throw "Get todo failed: fetched item id does not match created id"
}

Write-Host "Fetched single todo title:" $single.item.title

$imageResponse = Invoke-WebRequest `
  -Uri "$BaseUrl/api/todos/$id/image" `
  -Method Get `
  -UseBasicParsing

if ($imageResponse.RawContentLength -le 0) {
  throw "Get todo image failed: response did not include image bytes"
}

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

if ($updated.item.title -ne "Backend todo updated") {
  throw "Update todo failed: title was not updated"
}

if ($updated.item.is_completed -ne 1) {
  throw "Update todo failed: is_completed was not set to 1"
}

Write-Host "Updated todo id:" $updated.item.id

$deleted = Invoke-RestMethod -Uri "$BaseUrl/api/todos/$id" -Method Delete
if (-not $deleted.deleted -or $deleted.id -ne $id) {
  throw "Delete todo failed: response did not confirm deletion"
}

Write-Host "Deleted todo id:" $deleted.id

$afterDelete = Invoke-RestMethod -Uri "$BaseUrl/api/todos" -Method Get
if ($afterDelete.items | Where-Object { $_.id -eq $id }) {
  throw "Delete todo failed: deleted todo is still returned in list"
}

Write-Host "Todo count after delete:" $afterDelete.items.Count
Write-Host "Todo CRUD checks passed"
