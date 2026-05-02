set -e

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-MajorVersion {
    param([string]$VersionString)
    if ($VersionString -match '(\d+)\.') {
        return [int]$Matches[1]
    } elseif ($VersionString -match '^(\d+)$') {
        return [int]$VersionString
    } else {
        throw "无法解析版本号: $VersionString"
    }
}

try {
    $javaOutput = cmd /c "java -version 2>&1"
    if (-not $javaOutput) {
        throw "No output from 'java -version'"
    }
    $firstLine = ($javaOutput | Select-Object -First 1).Trim()
    if ($firstLine -match '(\d+)\.(\d+)') {
        $major = [int]$Matches[1]
        $minor = [int]$Matches[2]
        $effectiveVersion = if ($major -eq 1) { $minor } else { $major }
        if ($effectiveVersion -lt 17) {
            Write-Host "Java 版本过低，需要 >=17，当前: $effectiveVersion"
            exit 1
        }
        Write-Host "Java $effectiveVersion 满足要求"
    } else {
        throw "无法从 '$firstLine' 解析版本号"
    }
} catch {
    Write-Host "Java 未安装或版本检查失败: $_"
    exit 1
}

if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Host "Maven 未安装"
    exit 1
}
Write-Host "Maven 已安装"

try {
    $nodeVer = node -v
    $nodeMajor = Get-MajorVersion $nodeVer
    if ($nodeMajor -lt 22) {
        Write-Host "Node.js 版本过低，需要 >=22，当前: $nodeMajor"
        exit 1
    }
    Write-Host "Node.js $nodeMajor 满足要求"
} catch {
    Write-Host "Node.js 未安装或版本检查失败: $_"
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm 未安装"
    exit 1
}
Write-Host "npm 已安装"

if (Test-Path "frontend\dist") {
    Remove-Item "frontend\dist" -Recurse -Force
}

if (Test-Path "backend\target") {
    Remove-Item "backend\target" -Recurse -Force
}

Write-Host "构建前端..."
Push-Location frontend
npm install
npm run build
Pop-Location

Write-Host "复制前端构建产物到后端..."
$BACKEND_STATIC = "backend\src\main\resources\static"
if (-not (Test-Path $BACKEND_STATIC)) {
    New-Item -ItemType Directory -Path $BACKEND_STATIC | Out-Null
}
Remove-Item "$BACKEND_STATIC\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "frontend\dist\*" -Destination $BACKEND_STATIC -Recurse

Write-Host "构建后端 (Maven)..."
Push-Location backend
mvn clean package -DskipTests
Pop-Location

Write-Host "移动 JAR 包到当前目录..."
$JarFiles = @(Get-ChildItem -Path "backend\target" -Filter "*.jar" -File)
if ($JarFiles.Count -eq 0) {
    Write-Host "未找到 JAR 文件"
    exit 1
}
foreach ($jar in $JarFiles) {
    Move-Item -Path $jar.FullName -Destination "." -Force
    Write-Host "已移动: $($jar.Name)"
}

Write-Host "构建完成！"