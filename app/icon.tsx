import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"

export const size = {
  width: 256,
  height: 256,
}

export const contentType = "image/png"

const LOGO_CROP = {
  x: 96,
  y: 169,
  width: 136,
  height: 250,
}

const CROP_RENDER_HEIGHT = 196
const CROP_RENDER_WIDTH = Math.round(
  (LOGO_CROP.width / LOGO_CROP.height) * CROP_RENDER_HEIGHT
)
const SCALE = CROP_RENDER_HEIGHT / LOGO_CROP.height
const FULL_IMAGE_WIDTH = Math.round(920 * SCALE)
const FULL_IMAGE_HEIGHT = Math.round(420 * SCALE)
const OFFSET_X = Math.round(LOGO_CROP.x * SCALE)
const OFFSET_Y = Math.round(LOGO_CROP.y * SCALE)

export default async function Icon() {
  const logoPath = path.join(process.cwd(), "public/images/phone-garage-logo.jpg")
  const logoBuffer = await readFile(logoPath)
  const logoDataUri = `data:image/jpeg;base64,${logoBuffer.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            width: CROP_RENDER_WIDTH,
            height: CROP_RENDER_HEIGHT,
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <img
            alt="Phone Garage"
            src={logoDataUri}
            width={FULL_IMAGE_WIDTH}
            height={FULL_IMAGE_HEIGHT}
            style={{
              display: "block",
              marginLeft: -OFFSET_X,
              marginTop: -OFFSET_Y,
            }}
          />
        </div>
      </div>
    ),
    size
  )
}
