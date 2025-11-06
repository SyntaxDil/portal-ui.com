// Deployment Script for GoDaddy Hosting via FTP
require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// Simple CLI args parser (no external deps)
const argv = process.argv.slice(2);
const getArg = (name) => {
    const i = argv.indexOf(`--${name}`);
    return i !== -1 ? argv[i + 1] : undefined;
};
const hasFlag = (name) => argv.includes(`--${name}`);

// Predefined targets to simplify subfolder deployments
const targets = {
    jacked: {
        local: './Sites/JackedDnb/site',
        remote: '/public_html/Sites/JackedDnb',
    },
    templedjs: {
        local: './Sites/TempleDjSpot/site',
        remote: '/public_html/Spaces/TempleDjs',
    },
    templedjs_backbones: {
        local: './Sites/TempleDjSpot/site',
        remote: '/public_html/DoofBackBones',
    },
};

// FTP Configuration from environment variables
const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: parseInt(process.env.FTP_PORT) || 21,
    localRoot: process.env.FTP_LOCAL_DIR || './',
    remoteRoot: process.env.FTP_REMOTE_DIR || '/public_html',
    
    // Files to include (all files except excluded ones)
    include: ['*', '**/*'],
    
    // Files to exclude from deployment
    exclude: [
        'node_modules/**',
        'node_modules/**/.*',
        '.git/**',
        '.git/**/.*',
        '.env',
        '.env.example',
        'deploy.js',
        'package.json',
        'package-lock.json',
        'README.md',
        '.vscode/**',
        '.github/**',
        '**/*.md'
    ],
    
    // Delete remote files not in local directory
    deleteRemote: false,
    
    // Passive mode (usually required for GoDaddy)
    forcePasv: true,
    
    // SFTP options (set to false for standard FTP)
    sftp: false
};

// Apply target or explicit overrides
const target = getArg('target');
if (target && targets[target]) {
    config.localRoot = targets[target].local;
    config.remoteRoot = targets[target].remote;
}

// Direct overrides via CLI
config.localRoot = getArg('local') || config.localRoot;
config.remoteRoot = getArg('remote') || config.remoteRoot;
if (hasFlag('delete')) config.deleteRemote = true;

// Optional print-only mode for safe verification
if (hasFlag('print')) {
    console.log('🧪 Deployment configuration (print-only):');
    console.log({
        host: config.host,
        user: config.user,
        port: config.port,
        localRoot: config.localRoot,
        remoteRoot: config.remoteRoot,
        deleteRemote: config.deleteRemote,
        forcePasv: config.forcePasv,
        sftp: config.sftp,
    });
    process.exit(0);
}

// Validate configuration
if (!config.user || !config.password || !config.host) {
    console.error('❌ Error: Missing FTP credentials!');
    console.error('Please copy .env.example to .env and fill in your GoDaddy FTP details.');
    process.exit(1);
}

console.log('🚀 Starting deployment to GoDaddy...\n');
console.log(`📡 Host: ${config.host}`);
console.log(`👤 User: ${config.user}`);
console.log(`📁 Remote Directory: ${config.remoteRoot}`);
console.log(`📂 Local Directory: ${config.localRoot}\n`);

// Deploy
ftpDeploy
    .deploy(config)
    .then(res => {
        console.log('\n✅ Deployment completed successfully!');
        console.log(`🌐 Your website is now live at your domain`);
        console.log(`📄 Landing page: https://yourdomain.com/Registration.html\n`);
    })
    .catch(err => {
        console.error('\n❌ Deployment failed:', err);
        process.exit(1);
    });

// Event listeners for progress updates
ftpDeploy.on('uploading', function(data) {
    console.log(`⬆️  Uploading: ${data.filename} (${data.transferredFileCount}/${data.totalFilesCount})`);
});

ftpDeploy.on('uploaded', function(data) {
    console.log(`✓ Uploaded: ${data.filename}`);
});

ftpDeploy.on('log', function(data) {
    console.log(`ℹ️  ${data}`);
});
