


# Quality Comparison Image Comparison Website

A web application for comparing image quality using JavaScript, HTML, CSS, and PHP.

## Features
- Select different episodes and frames for comparison.
- Interactive slider for image comparison.
- Loading screen with progress information.
- Responsive design for various screen sizes.

## Technologies Used
- JavaScript
- HTML
- CSS
- PHP

## How to Use

### Installation Instructions
1. Clone the repository to your local machine.
   ```bash
   git clone https://github.com/d3se/interactive-image-quality-comparison.git
   ```
2. Configure your web server to serve PHP files.

3. Copy the project files to the web server's directory.

4. Open the website in a web browser.

### How PHP Parses Directories and Images

The PHP script (`getEpisodes.php`) parses directories and images using the following conventions:

- The main project directory should contain subdirectories, each representing an episode.

- Inside each episode directory, you should place pairs of 'before' and 'after' images for comparison. For example:
  - `ep01_before.png` and `ep01_after.png`
  - `ep02_before.png` and `ep02_after.png`

- The PHP script scans the main project directory and identifies episodes and their corresponding images based on the 'before' and 'after' naming conventions.

- It collects this data and provides it as JSON to the JavaScript front-end, allowing users to select episodes and frames for comparison.

### Project Directory Structure
The project directory structure should look like this:
```
project-root/
│
├── episode1/
│   ├── ep01_before.png
│   └── ep01_after.png
│
├── episode2/
│   ├── ep02_before.png
│   └── ep02_after.png
│
└── getEpisodes.php
```

### Important Naming Conventions
- The episode directories should be named `episode1`, `episode2`, etc., for easy identification.

- Each 'before' image should be named `epXX_before.png`, where `XX` represents the episode number (e.g., `ep01_before.png` for episode 1).

- Each 'after' image should be named `epXX_after.png`, following the same episode number convention (e.g., `ep01_after.png` for episode 1).

## Contributing
Contributions are welcome. Feel free to open issues or submit pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact Information
For questions or feedback, contact [d3se](https://github.com/d3se).
```

