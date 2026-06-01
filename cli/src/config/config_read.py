from ruamel.yaml import YAML
from src.moudle.config_moudle import DimStackConfig


class Config:

    def read_yaml(self, filepath: str):
        yaml = YAML()
        yaml.preserve_quotes = True

        with open(filepath, "r", encoding="utf-8") as f:
            raw = yaml.load(f)
        return DimStackConfig.model_validate(raw)

