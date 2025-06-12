# Yeti Talki - Deployment Package

## Easy Integration to yetitech.fun

### Method 1: Add to Existing Vercel Project

1. Copy the `build` folder contents to your yetitech.fun project
2. Add the vercel.json rewrites to your existing vercel.json:

```json
{
  "rewrites": [
    ...your existing rewrites,
    {
      "source": "/yeheyehenevergoingtoknowtheconnectionpath",
      "destination": "/yeti-talki/index.html"
    },
    {
      "source": "/yeheyehenevergoingtoknowtheconnectionpath/(.*)",
      "destination": "/yeti-talki/static/$1"
    }
  ]
}
```

3. Deploy your updated project

### Method 2: Direct Upload

1. Create a `yeti-talki` folder in your project root
2. Copy all contents from the `build` folder into it
3. Access at: `yetitech.fun/yeheyehenevergoingtoknowtheconnectionpath`

### Files Included:
- `build/` - Complete production build
- `vercel.json` - Vercel configuration
- `audio/king_yeti_audio.mp3` - Your audio file

### Features:
✅ Full Yeti Tech aesthetic
✅ Working audio playback
✅ Shutdown animation → redirects to yetitech.fun
✅ All functionality preserved
✅ Mobile-ready
✅ Optimized build (155KB)

Access your hidden Yeti Talki at:
`https://yetitech.fun/yeheyehenevergoingtoknowtheconnectionpath`