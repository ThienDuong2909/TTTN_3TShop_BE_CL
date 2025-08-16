const fs = require('fs');
const path = require('path');

// Function to check if a controller method exists
function checkControllerMethod(controllerPath, methodName) {
  try {
    const controller = require(controllerPath);
    return typeof controller[methodName] === 'function';
  } catch (error) {
    console.error(`Error loading controller ${controllerPath}:`, error.message);
    return false;
  }
}

// Function to extract controller methods from route files
function extractControllerMethods(routeContent) {
  const methods = [];
  const regex = /Controller\.(\w+)/g;
  let match;
  
  while ((match = regex.exec(routeContent)) !== null) {
    methods.push(match[1]);
  }
  
  return [...new Set(methods)]; // Remove duplicates
}

// Function to check a single route file
function checkRouteFile(routePath) {
  try {
    const content = fs.readFileSync(routePath, 'utf8');
    const controllerMatch = content.match(/require\(['"]([^'"]*Controller)['"]\)/);
    
    if (!controllerMatch) {
      console.log(`⚠️  ${path.basename(routePath)}: No controller import found`);
      return;
    }
    
    const controllerPath = path.resolve(__dirname, 'src', controllerMatch[1] + '.js');
    const methods = extractControllerMethods(content);
    
    console.log(`\n📁 ${path.basename(routePath)}:`);
    console.log(`   Controller: ${controllerMatch[1]}`);
    
    let allValid = true;
    methods.forEach(method => {
      const isValid = checkControllerMethod(controllerPath, method);
      const status = isValid ? '✅' : '❌';
      console.log(`   ${status} ${method}`);
      if (!isValid) allValid = false;
    });
    
    if (allValid) {
      console.log(`   ✅ All methods valid`);
    } else {
      console.log(`   ❌ Some methods missing`);
    }
    
  } catch (error) {
    console.error(`❌ Error checking ${routePath}:`, error.message);
  }
}

// Main execution
console.log('🔍 Checking all route files for controller method issues...\n');

const routesDir = path.join(__dirname, 'src', 'routes');
const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

routeFiles.forEach(file => {
  checkRouteFile(path.join(routesDir, file));
});

console.log('\n✅ Route checking completed!'); 