import sys

content = open('src/App.tsx').read()

# Add inDesktop state
state_marker = "const [user, setUser] = useState<User | null>(null);"
if state_marker not in content:
    print("Cannot find state marker")
    sys.exit(1)

content = content.replace(state_marker, state_marker + "\n  const [inDesktop, setInDesktop] = useState(true);")

# Remove authLoading spinner
spinner_marker = 'if (authLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;'
if spinner_marker in content:
    content = content.replace(spinner_marker, "")
else:
    print("Could not find authLoading spinner")

# Replace old if (!user) rendering with inDesktop rendering
old_user_render = """  if (!user) {
    return <DesktopLoginScreen onLogin={handleGoogleLogin} isLoggingIn={isLoggingIn} />;
  }"""
new_desktop_render = """  if (inDesktop) {
    return <DesktopOS user={user} onLogin={handleGoogleLogin} isLoggingIn={isLoggingIn || authLoading} onLaunch={() => setInDesktop(false)} />;
  }
  
  if (!user) {
    // If not in desktop and not user (e.g. they somehow bypassed or logged out), go back to desktop
    setInDesktop(true);
    return null;
  }"""
if old_user_render in content:
    content = content.replace(old_user_render, new_desktop_render)
elif "if (!user)" in content:
    print("Found if (!user) but didn't match exactly. Let me search and replace manually.")
    start_idx = content.find("if (!user) {")
    end_idx = content.find("}", start_idx) + 1
    content = content[:start_idx] + new_desktop_render + content[end_idx:]
else:
    print("Could not find if (!user)")

open('src/App.tsx', 'w').write(content)
print("Updated App rendering successfully")
