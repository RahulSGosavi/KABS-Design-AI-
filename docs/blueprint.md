# **App Name**: KABS Design AI

## Core Features:

- PDF Upload and Extraction: Allow users to upload 2D floor plan PDFs and extract key elements like walls, doors, windows, cabinets, sinks, and appliances.
- Image-to-Image Rendering: Utilize Leonardo AI's image-to-image capability to generate photorealistic kitchen renders from the extracted floor plan, ensuring the layout remains identical. The Leonardo AI api key will be read from the .env file.
- Live Color Change: Provide a live color change panel that allows users to modify the colors of base cabinets, wall cabinets, doors, and walls using Leonardo AI's masked region update tool. The tool will ensure the layout and lighting are not altered.
- Download Rendered Image: Enable users to download the rendered image in PNG or JPG format along with the attached reference PDF.

## Style Guidelines:

- Background color: White (#FFFFFF) for a clean and modern look.
- Primary color: Soft gray (#E0E0E0) to create a neutral base.
- Accent color: Muted blue (#79B4B7) for a subtle touch of sophistication.
- Font: 'Roboto', a sans-serif font, for a modern and readable look that suits both headlines and body text.
- Use minimalist, stylish icons to represent various kitchen elements.
- Maintain a clean and straightforward layout for ease of use.
- Use subtle, stylish transitions during color changes to provide a smooth user experience.