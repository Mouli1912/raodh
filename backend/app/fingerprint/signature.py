"""Alert signature and deploy change fingerprint."""

from typing import Any, Dict


def compute_alert_signature(alert_payload: Dict[str, Any]) -> str:
    """Compute structural alert signature."""
    pass


def compute_deploy_fingerprint(deploy_payload: Dict[str, Any]) -> str:
    """Compute deploy change fingerprint."""
    pass
