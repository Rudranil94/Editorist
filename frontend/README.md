# Editorist Frontend

The frontend application for Editorist, an AI-powered video editing tool for content creators.

## Features

- Drag-and-drop video upload
- Real-time job status tracking
- Configurable processing options
- Modern, responsive UI
- Real-time progress updates

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:8000/api/v1/videos
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build output will be in the `build` directory.

## Development

### Project Structure

```
src/
  ├── components/     # React components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── hooks/         # Custom React hooks
  ├── utils/         # Utility functions
  └── styles/        # CSS styles
```

### Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Create a production build
- `npm run eject` - Eject from Create React App

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 