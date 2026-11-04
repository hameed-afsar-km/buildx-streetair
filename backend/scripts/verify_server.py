"""
Verification script using asyncio to run uvicorn server and probe endpoints.
"""
import asyncio
import sys
import httpx
import uvicorn

sys.path.insert(0, r"C:\Users\Core\OneDrive\Desktop\SteetAir\backend")
from app.main import app

async def main():
    config = uvicorn.Config(app, host="127.0.0.1", port=8888, log_level="warning")
    server = uvicorn.Server(config)
    
    server_task = asyncio.create_task(server.serve())
    
    # Wait for server to start
    for _ in range(50):
        if server.started:
            break
        await asyncio.sleep(0.1)
    
    try:
        async with httpx.AsyncClient(base_url="http://127.0.0.1:8888", timeout=5.0) as client:
            h_resp = await client.get("/health")
            print("GET /health -> status:", h_resp.status_code, "body:", h_resp.json())
            assert h_resp.status_code == 200

            r_resp = await client.get("/ready")
            print("GET /ready -> status:", r_resp.status_code, "body:", r_resp.json())
            assert r_resp.status_code == 200

            d_resp = await client.get("/openapi.json")
            print("GET /openapi.json -> status:", d_resp.status_code, "routes count:", len(d_resp.json()["paths"]))
            assert d_resp.status_code == 200
            
            plans_resp = await client.get("/api/v1/plans")
            print("GET /api/v1/plans -> status:", plans_resp.status_code)
            assert plans_resp.status_code == 200
            
            print(">>> LIVE SERVER PROBE TEST PASSED 100% <<<")
    finally:
        server.should_exit = True
        await server_task

if __name__ == "__main__":
    asyncio.run(main())
