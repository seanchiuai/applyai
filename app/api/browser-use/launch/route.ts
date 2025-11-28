import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST() {
  try {
    const browserUsePath = path.join(process.cwd(), "browser-use");
    const pythonPath = path.join(browserUsePath, "venv", "bin", "python");
    const scriptPath = path.join(browserUsePath, "main.py");

    // Spawn the Python process in background
    const child = spawn(pythonPath, [scriptPath], {
      cwd: browserUsePath,
      detached: true,
      stdio: "ignore",
    });

    // Unref to allow parent process to exit independently
    child.unref();

    return NextResponse.json({
      success: true,
      message: "Browser automation started successfully",
      pid: child.pid,
    });
  } catch (error) {
    console.error("Failed to launch browser-use:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to launch browser automation",
      },
      { status: 500 }
    );
  }
}
