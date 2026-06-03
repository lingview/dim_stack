import sys


class CommandRouter:

    def __init__(self):
        self.commands = {}

    def register(self, name: str, handler):
        self.commands[name] = handler

    def parse_port(self) -> int | None:
        for arg in sys.argv[2:]:
            if arg.startswith("--port="):
                port_str = arg.split("=", 1)[1]
                try:
                    return int(port_str)
                except ValueError:
                    print(f"✗ 无效的端口号: {port_str}")
                    sys.exit(1)
        return None

    def dispatch(self):
        if len(sys.argv) < 2:
            self._show_help()
            return

        command = sys.argv[1]

        if command == "help":
            self._show_help()
            return

        if command not in self.commands:
            print(f"✗ 未知命令: {command}")
            self._show_help()
            sys.exit(1)

        port = self.parse_port()
        success = self.commands[command](port=port)
        sys.exit(0 if success else 1)

    def _show_help(self):
        print("Dim Stack CLI")
        print()
        print("系统管理命令:")
        print("  start [--port=<端口>]   - 启动系统")
        print("  stop [--port=<端口>]    - 关闭系统")
        print("  restart [--port=<端口>] - 重启系统")
        print()
        print("配置管理命令:")
        print("  config                  - 打开配置菜单")
        print("  set-dir <路径>          - 设置项目目录")
        print("  get-dir                 - 查看当前项目目录")
        print("  set-jar <名称>          - 设置 JAR 名称")
        print("  get-jar                 - 查看当前 JAR 名称")
        print()
        print("其他命令:")
        print("  help                    - 显示此帮助信息")
        print()
        print("示例:")
        print("  python main.py start --port=2223")
        print("  python main.py restart --port=8080")
        print("  python main.py set-jar my-app.jar")
        print()
