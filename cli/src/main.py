import os
import sys
from config.config_read import Config
from model.cli_menu import CliMenu


def main():
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "config":
            menu = CliMenu()
            menu.show_menu()
            return
        elif command == "set-dir":
            if len(sys.argv) > 2:
                from config.cli_config import CliConfig
                config_mgr = CliConfig()
                try:
                    config_mgr.set_project_dir(sys.argv[2])
                    print(f"✓ 项目运行目录已设置为: {os.path.abspath(sys.argv[2])}")
                except ValueError as e:
                    print(f"✗ 设置失败: {e}")
                    sys.exit(1)
            else:
                print("用法: python main.py set-dir <目录路径>")
                sys.exit(1)
            return
        elif command == "get-dir":
            from config.cli_config import CliConfig
            config_mgr = CliConfig()
            project_dir = config_mgr.get_project_dir()
            if project_dir:
                print(project_dir)
            else:
                print("未设置项目运行目录")
            return

    print("Dim Stack CLI")
    print("使用 'config' 命令打开配置菜单")
    print("使用 'set-dir <path>' 快速设置项目目录")
    print("使用 'get-dir' 查看当前项目目录")
    print()
    
    config = Config()
    data = config.read_yaml("../../config/application.yml")
    print(data.server.port)


if __name__ == "__main__":
    main()