## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo
   ```

3. Ensure .env variables by creating a .env with your IP:

- Example: When you run npx expo it will say
- › Metro waiting on exp://###.###.#.###:8081

- Put in the .env - EXPO_PUBLIC_IP_ADDRESS=###.###.#.###
- Ensure your IP is also whitelisted in Mongo DB's collection

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Run the server

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    node server.js
   ```

## To maintain a consistent and high-quality codebase, this project adheres to the following coding standards:

Formatting: We use Prettier to automatically format code. Ensure that Prettier is configured in your code editor to format on save. 

Naming Conventions: Use camelCase for variable and function names, PascalCase for React components, and UPPER_SNAKE_CASE for constants. 

TypeScript Standards: This project uses TypeScript for type safety.

File Organization: Place React components in their respective directories within the app folder. 

Linting: The project uses ESLint to enforce coding rules. 