import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Generate the image
export default function Icon() {
    const iconPath = join(process.cwd(), 'app/favicon-source.png');
    // @ts-ignore
    const iconData = readFileSync(iconPath);

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'transparent',
                }}
            >
                <img
                    src={iconData.buffer as any}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
