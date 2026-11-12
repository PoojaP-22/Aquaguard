"""Unit tests for AquaGuard's deterministic scoring services."""

import unittest

from app.services.phi_service import calculate_phi, phi_to_status
from app.services.priority_service import calculate_repair_priority


class PhiServiceTests(unittest.TestCase):
    def test_phi_is_bounded(self):
        self.assertGreaterEqual(calculate_phi(100, 0.0, 0.0), 0.0)
        self.assertLessEqual(calculate_phi(0, 1.0, 40.0), 100.0)

    def test_phi_status_boundaries(self):
        self.assertEqual(phi_to_status(90), "Healthy")
        self.assertEqual(phi_to_status(75), "Warning")
        self.assertEqual(phi_to_status(60), "High Risk")
        self.assertEqual(phi_to_status(59.9), "Critical")


class RepairPriorityTests(unittest.TestCase):
    def test_results_are_ranked_by_score(self):
        pipelines = [
            {"pipeline_id": "P01", "zone": "North", "leak_risk": 10, "phi": 95, "time_to_failure": "30 days", "status": "Healthy"},
            {"pipeline_id": "P02", "zone": "South", "leak_risk": 90, "phi": 40, "time_to_failure": "12 hours", "status": "Critical"},
        ]
        results = calculate_repair_priority(pipelines)
        self.assertEqual([item["rank"] for item in results], [1, 2])
        self.assertEqual(results[0]["pipeline_id"], "P02")
        self.assertGreaterEqual(results[0]["priority_score"], results[1]["priority_score"])

    def test_empty_pipeline_list_returns_empty_results(self):
        self.assertEqual(calculate_repair_priority([]), [])


if __name__ == "__main__":
    unittest.main()
