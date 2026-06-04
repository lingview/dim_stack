import os
import sys
from view.cli_menu import CliMenu
from core.server_control import ServerControl
from core.command_router import CommandRouter


def cmd_config(**kwargs) -> bool:
    menu = CliMenu()
    menu.show_menu()
    return True


def cmd_set_dir(**kwargs) -> bool:
    if len(sys.argv) < 3:
        print("用法: ds set-dir <目录路径>")
        sys.exit(1)
    from config.cli_config import CliConfig
    config_mgr = CliConfig()
    try:
        config_mgr.set_project_dir(sys.argv[2])
        print(f"✓ 项目运行目录已设置为: {os.path.abspath(sys.argv[2])}")
        return True
    except ValueError as e:
        print(f"✗ 设置失败: {e}")
        sys.exit(1)


def cmd_get_dir(**kwargs) -> bool:
    from config.cli_config import CliConfig
    config_mgr = CliConfig()
    project_dir = config_mgr.get_project_dir()
    if project_dir:
        print(project_dir)
    else:
        print("未设置项目运行目录")
    return True


def cmd_set_jar(**kwargs) -> bool:
    if len(sys.argv) < 3:
        print("用法: ds set-jar <JAR 名称>")
        sys.exit(1)
    from config.cli_config import CliConfig
    config_mgr = CliConfig()
    try:
        config_mgr.set_jar_name(sys.argv[2])
        print(f"✓ JAR 名称已设置为: {sys.argv[2]}")
        return True
    except Exception as e:
        print(f"✗ 设置失败: {e}")
        sys.exit(1)


def cmd_get_jar(**kwargs) -> bool:
    from config.cli_config import CliConfig
    config_mgr = CliConfig()
    print(config_mgr.get_jar_name())
    return True


def cmd_start(port: int = None, **kwargs) -> bool:
    control = ServerControl()
    return control.start(port=port)


def cmd_stop(port: int = None, **kwargs) -> bool:
    control = ServerControl()
    return control.stop(port=port)


def cmd_restart(port: int = None, **kwargs) -> bool:
    control = ServerControl()
    return control.restart(port=port)


def main():
    router = CommandRouter()
    router.register("config", cmd_config)
    router.register("set-dir", cmd_set_dir)
    router.register("get-dir", cmd_get_dir)
    router.register("set-jar", cmd_set_jar)
    router.register("get-jar", cmd_get_jar)
    router.register("start", cmd_start)
    router.register("stop", cmd_stop)
    router.register("restart", cmd_restart)
    router.dispatch()


if __name__ == "__main__":
    main()
