import os
import sys
import subprocess
import re
from pathlib import Path
from config.config_read import Config
from config.cli_config import CliConfig


class ServerControl:

    def __init__(self):
        self.config = self._load_config()
        self.port = self.config.server.port
        self.project_dir = self._get_project_dir()
        self.config_manager = CliConfig()

    def _load_config(self):
        config_path = self._find_config_path()
        config = Config()
        return config.read_yaml(config_path)

    def _find_config_path(self) -> str:
        project_dir = self._get_project_dir()
        if project_dir:
            config_path = os.path.join(project_dir, "config", "application.yml")
            if os.path.exists(config_path):
                return config_path

        cwd_config = os.path.join(os.getcwd(), "config", "application.yml")
        if os.path.exists(cwd_config):
            return cwd_config

        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        config_path = os.path.join(repo_root, "config", "application.yml")
        if os.path.exists(config_path):
            return config_path

        cli_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        config_path = os.path.join(cli_root, "config", "application.yml")
        if os.path.exists(config_path):
            return config_path

        raise FileNotFoundError("找不到配置文件 application.yml")

    def _get_project_dir(self) -> str | None:
        config_mgr = CliConfig()
        return config_mgr.get_project_dir()

    def _find_process_by_port(self) -> int | None:
        try:
            if os.name == "nt":
                result = subprocess.run(
                    f"netstat -ano | findstr :{self.port}",
                    capture_output=True,
                    text=True,
                    shell=True
                )
                
                if result.returncode != 0 or not result.stdout.strip():
                    return None

                for line in result.stdout.strip().split("\n"):
                    if "LISTENING" in line:
                        parts = line.split()
                        if len(parts) >= 5:
                            pid = int(parts[-1])
                            return pid
                
                return None
            else:
                result = subprocess.run(
                    f"lsof -ti :{self.port}",
                    capture_output=True,
                    text=True,
                    shell=True
                )
                
                if result.returncode != 0 or not result.stdout.strip():
                    return None

                pid = int(result.stdout.strip().split("\n")[0])
                return pid
                
        except Exception as e:
            print(f"✗ 查找进程时出错: {e}")
            return None

    def _kill_process(self, pid: int) -> bool:
        try:
            if os.name == "nt":
                result = subprocess.run(
                    f"taskkill /F /PID {pid}",
                    capture_output=True,
                    text=True,
                    shell=True
                )
                
                if result.returncode == 0:
                    return True
                else:
                    print(f"✗ 杀死进程失败: {result.stderr.strip()}")
                    return False
            else:
                result = subprocess.run(
                    f"kill -9 {pid}",
                    capture_output=True,
                    text=True,
                    shell=True
                )
                
                return result.returncode == 0
                
        except Exception as e:
            print(f"✗ 杀死进程时出错: {e}")
            return False

    def _get_jar_path(self) -> str:
        jar_name = self.config_manager.get_jar_name()
        
        if self.project_dir:
            jar_path = os.path.join(self.project_dir, jar_name)
            if os.path.exists(jar_path):
                return jar_path

        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        jar_path = os.path.join(repo_root, jar_name)
        if os.path.exists(jar_path):
            return jar_path

        raise FileNotFoundError(f"找不到 {jar_name} 文件")

    def start(self, port: int | None = None):
        use_port = port if port is not None else self.port
        print(f"正在检查端口 {use_port} 是否已被占用...")

        original_port = self.port
        if port is not None:
            self.port = port

        pid = self._find_process_by_port()
        if pid is not None:
            print(f"✗ 系统已在运行中 (PID: {pid}, 端口: {use_port})")
            self.port = original_port
            return False

        print(f"端口 {use_port} 可用，正在启动系统...")

        try:
            jar_path = self._get_jar_path()
            print(f"使用 JAR: {jar_path}")

            work_dir = self.project_dir if self.project_dir else os.path.dirname(jar_path)
            print(f"工作目录: {work_dir}")

            cmd = ["java", "-jar", jar_path]
            if port is not None:
                cmd.append(f"--server.port={port}")
                print(f"自定义端口: {port}")

            if os.name == "nt":
                CREATE_NO_WINDOW = 0x08000000
                DETACHED_PROCESS = 0x00000008
                subprocess.Popen(
                    cmd,
                    cwd=work_dir,
                    creationflags=CREATE_NO_WINDOW | DETACHED_PROCESS,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    stdin=subprocess.DEVNULL
                )
            else:
                subprocess.Popen(
                    cmd,
                    cwd=work_dir,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )

            self.port = original_port

            print(f"✓ 系统启动中... (端口: {use_port})")
            print("  提示: 可以通过日志查看启动状态")
            return True

        except Exception as e:
            print(f"✗ 启动失败: {e}")
            self.port = original_port
            return False

    def stop(self, port: int | None = None):
        use_port = port if port is not None else self.port
        print(f"正在检查端口 {use_port} 上的进程...")

        original_port = self.port
        if port is not None:
            self.port = port

        pid = self._find_process_by_port()
        if pid is None:
            print(f"✗ 系统未在运行 (端口: {use_port})")
            self.port = original_port
            return False

        print(f"找到进程 PID: {pid}，正在关闭...")

        if self._kill_process(pid):
            print(f"✓ 系统已关闭 (PID: {pid})")
            self.port = original_port
            return True
        else:
            print(f"✗ 关闭失败")
            self.port = original_port
            return False

    def restart(self, port: int | None = None):
        use_port = port if port is not None else self.port
        print("正在重启系统...")

        original_port = self.port
        if port is not None:
            self.port = port

        pid = self._find_process_by_port()
        if pid is not None:
            print(f"检测到运行中的进程 (PID: {pid})，正在关闭...")
            if not self._kill_process(pid):
                print("✗ 关闭失败，取消重启")
                self.port = original_port
                return False
            print("✓ 已关闭")
        else:
            print("系统未在运行，直接启动")

        import time
        time.sleep(2)

        self.port = original_port

        return self.start(port=port)


def main():
    if len(sys.argv) < 2:
        print("用法:")
        print("  python server_control.py start   - 启动系统")
        print("  python server_control.py stop    - 关闭系统")
        print("  python server_control.py restart - 重启系统")
        sys.exit(1)

    command = sys.argv[1]
    control = ServerControl()

    if command == "start":
        success = control.start()
        sys.exit(0 if success else 1)
    elif command == "stop":
        success = control.stop()
        sys.exit(0 if success else 1)
    elif command == "restart":
        success = control.restart()
        sys.exit(0 if success else 1)
    else:
        print(f"✗ 未知命令: {command}")
        print("支持的命令: start, stop, restart")
        sys.exit(1)


if __name__ == "__main__":
    main()
