import unittest
from pathlib import Path


DOCKER_DIR = Path(__file__).resolve().parents[1]


class StaticConfigurationTests(unittest.TestCase):
    def test_nginx_routes_api_to_app_and_preserves_static_and_health_routes(self):
        config = (DOCKER_DIR / "nginx" / "default.conf").read_text()

        self.assertIn("location /api/ {", config)
        self.assertIn("proxy_pass http://app:8000;", config)
        self.assertIn("proxy_connect_timeout 3s;", config)
        self.assertIn("proxy_send_timeout 60s;", config)
        self.assertIn("proxy_read_timeout 60s;", config)
        self.assertIn("proxy_request_buffering on;", config)
        self.assertIn("client_max_body_size 11m;", config)
        self.assertIn("location / {", config)
        self.assertIn("try_files $uri $uri/ /index.html;", config)
        self.assertIn("location /health {", config)
        self.assertIn('"service":"bluepeak-web"', config)

    def test_compose_keeps_api_and_database_internal_and_ports_loopback_only(self):
        config = (DOCKER_DIR / "docker-compose.yml").read_text()
        app_section = config.split("  app:\n", 1)[1].split("  # ── MinIO", 1)[0]
        database_section = config.split("  database:\n", 1)[1].split(
            "  # ── Application API", 1
        )[0]

        self.assertNotIn("ports:", app_section)
        self.assertNotIn("ports:", database_section)
        self.assertIn("condition: service_healthy", app_section)
        self.assertIn("127.0.0.1:8081:80", config)
        self.assertIn("127.0.0.1:19000:9000", config)
        self.assertIn("127.0.0.1:19001:9001", config)


if __name__ == "__main__":
    unittest.main()
