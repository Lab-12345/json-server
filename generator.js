const fs = require('fs');

function parseJsonConfig(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8').trim(); // Trim whitespace
        if (!rawData) {
            throw new Error(`File "${filePath}" is empty`);
        }
        const config = JSON.parse(rawData);
        if (!config.nodes || !Array.isArray(config.nodes)) {
            throw new Error('Invalid JSON: "nodes" must be an array');
        }
        return config.nodes;
    } catch (error) {
        console.error(`Error parsing JSON from ${filePath}: ${error.message}`);
        process.exit(1); // Exit with failure code
    }
}

function generateServer(nodes) {
    let imports = `const express = require("express");\nconst cors = require("cors");\nconst app = express();\n\n`;
    let setup = `app.use(cors({ origin: "*" }));\napp.use(express.json());\n\n`;
    let middleware = '';
    let routes = '';

    nodes.forEach(node => {
        if (node.properties.type === 'middleware') {
            if (node.properties.auth_required) {
                middleware += `
const authMiddleware = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};\n`;
            } else if (node.properties.admin_required) {
                middleware += `
const adminMiddleware = (req, res, next) => {
    if (req.headers.authorization !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};\n`;
            }
        } else if (node.properties.endpoint && node.properties.method) {
            const method = node.properties.method.toLowerCase();
            let routeMiddleware = '';
            if (node.source) {
                const sourceNode = nodes.find(n => n.id === node.source);
                if (sourceNode) {
                    if (sourceNode.properties.auth_required) routeMiddleware += 'authMiddleware, ';
                    if (sourceNode.properties.admin_required) routeMiddleware += 'adminMiddleware, ';
                }
            }
            let message;
            switch (node.properties.endpoint) {
                case '/login': message = "Login successful"; break;
                case '/signup': message = "Signup successful"; break;
                case '/signout': message = "Signout successful"; break;
                case '/user': message = "User data"; break;
                case '/admin': message = "Admin data"; break;
                case '/home': message = "Welcome to Home Page"; break;
                case '/about': message = "About us"; break;
                case '/news': message = "Latest news"; break;
                case '/blogs': message = "Blogs list"; break;
                default: message = `${node.name} response`;
            }
            routes += `app.${method}("${node.properties.endpoint}", ${routeMiddleware}(req, res) => res.json({ message: "${message}" }));\n`;
        }
    });

    return `${imports}${setup}${middleware}${routes}\napp.listen(3000, () => console.log("Server running on port 3000"));`;
}

function main(inputFile, outputFile) {
    const nodes = parseJsonConfig(inputFile);
    const serverCode = generateServer(nodes);
    fs.writeFileSync(outputFile, serverCode);
    console.log(`Server generated at ${outputFile}`);
}

main('example.json', 'server.js');