import os
import json
from pathlib import Path


class CliConfig:
    
    CONFIG_DIR = ".dim_stack-cli"
    CONFIG_FILE = "config.json"
    
    def __init__(self):
        self.config_path = self._get_config_path()
    
    def _get_config_path(self) -> Path:
        home_dir = Path.home()
        config_dir = home_dir / self.CONFIG_DIR
        return config_dir / self.CONFIG_FILE
    
    def load_config(self) -> dict:
        if not self.config_path.exists():
            self._create_default_config()
        
        with open(self.config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def save_config(self, config: dict) -> None:
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(self.config_path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    
    def get_project_dir(self) -> str | None:
        config = self.load_config()
        return config.get("project_dir")
    
    def set_project_dir(self, project_dir: str) -> None:
        abs_path = os.path.abspath(project_dir)

        if not os.path.isdir(abs_path):
            raise ValueError(f"目录不存在: {abs_path}")
        
        config = self.load_config()
        config["project_dir"] = abs_path
        self.save_config(config)
    
    def _create_default_config(self) -> None:
        from datetime import datetime
        default_config = {
            "project_dir": "",
            "created_at": datetime.now().isoformat(),
        }
        self.save_config(default_config)
    
    def config_exists(self) -> bool:
        return self.config_path.exists()
