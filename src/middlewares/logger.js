const fs = require('fs');
const path = require('path');

const logger = (req, res, next) => {
  // Check if logging is enabled
  const isLoggingEnabled = process.env.API_LOGGING !== 'false';
  
  if (!isLoggingEnabled) {
    return next();
  }
  
  const start = Date.now();
  
  // Get request info
  const { method, originalUrl, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'Unknown';
  const authorization = headers.authorization ? 'Bearer ***' : 'No auth';
  
  // Create log function
  const logToConsole = (message) => {
    console.log(message);
  };
  
  const logToFile = (message) => {
    if (process.env.LOG_TO_FILE === 'true') {
      const logDir = path.join(__dirname, '../../logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `api-${new Date().toISOString().split('T')[0]}.log`);
      const timestamp = new Date().toISOString();
      const cleanMessage = message.replace(/🔵|🟢|🟡|🔴|⚪|📅|🌐|🔗|🔐|📱|📝|❓|🔢|⏱️|📊|✅|💬|📄|=/g, '');
      
      fs.appendFileSync(logFile, `[${timestamp}] ${cleanMessage}\n`);
    }
  };
  
  const log = (message) => {
    logToConsole(message);
    logToFile(message);
  };
  
  // Log request
  log('\n🔵 ============= API REQUEST =============');
  log(`📅 Time: ${new Date().toLocaleString('vi-VN')}`);
  log(`🌐 ${method} ${originalUrl}`);
  log(`🔗 IP: ${ip}`);
  log(`🔐 Auth: ${authorization}`);
  log(`📱 User-Agent: ${userAgent}`);
  
  // Log request body if exists
  if (req.body && Object.keys(req.body).length > 0) {
    log(`📝 Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  
  // Log query params if exists
  if (req.query && Object.keys(req.query).length > 0) {
    log(`❓ Query: ${JSON.stringify(req.query)}`);
  }
  
  // Log route params if exists
  if (req.params && Object.keys(req.params).length > 0) {
    log(`🔢 Params: ${JSON.stringify(req.params)}`);
  }
  
  // Intercept response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log response
    log(`⏱️  Duration: ${duration}ms`);
    log(`📊 Status: ${statusCode}`);
    
    // Log response body (truncated if too long)
    if (body) {
      try {
        const parsedBody = JSON.parse(body);
        if (parsedBody.success !== undefined) {
          log(`✅ Success: ${parsedBody.success}`);
          log(`💬 Message: ${parsedBody.message || 'No message'}`);
          
          // Log data length if it's an array
          if (Array.isArray(parsedBody.data)) {
            log(`📊 Data Length: ${parsedBody.data.length} items`);
          } else if (parsedBody.data) {
            log(`📄 Data: Has response data`);
          }
        }
      } catch (e) {
        log(`📄 Response: ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}`);
      }
    }
    
    // Color coding based on status
    if (statusCode >= 200 && statusCode < 300) {
      log('🟢 ============= SUCCESS =============\n');
    } else if (statusCode >= 400 && statusCode < 500) {
      log('🟡 ============= CLIENT ERROR =============\n');
    } else if (statusCode >= 500) {
      log('🔴 ============= SERVER ERROR =============\n');
    } else {
      log('⚪ ============= COMPLETED =============\n');
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

module.exports = logger; 