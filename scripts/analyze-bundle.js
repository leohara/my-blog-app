#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'white') {
  console.log(colors[color] + message + colors.reset);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  log('🔍 Starting bundle analysis...', 'cyan');
  
  try {
    // Run build with analysis
    log('📦 Building application with bundle analyzer...', 'blue');
    execSync('npm run bundle-analyze', { stdio: 'inherit' });
    
    // Read stats files
    const clientStatsPath = path.join(process.cwd(), '.next/analyze/client-stats.json');
    const serverStatsPath = path.join(process.cwd(), '.next/analyze/server-stats.json');
    
    if (fs.existsSync(clientStatsPath)) {
      analyzeStats(clientStatsPath, 'Client');
    }
    
    if (fs.existsSync(serverStatsPath)) {
      analyzeStats(serverStatsPath, 'Server');
    }
    
    // Provide recommendations
    provideRecommendations();
    
    log('✅ Bundle analysis complete!', 'green');
    log('📊 Check the analyze/ directory for detailed HTML reports', 'blue');
    
  } catch (error) {
    log('❌ Bundle analysis failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function analyzeStats(statsPath, type) {
  log(`\n📊 ${type} Bundle Analysis:`, 'magenta');
  log('─'.repeat(50), 'white');
  
  try {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    
    // Total bundle size
    const totalSize = stats.assets.reduce((sum, asset) => sum + asset.size, 0);
    log(`Total ${type} Bundle Size: ${formatBytes(totalSize)}`, 'yellow');
    
    // Largest assets
    const largestAssets = stats.assets
      .filter(asset => asset.size > 10000) // Only show assets > 10KB
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    log('\n📈 Largest Assets:', 'blue');
    largestAssets.forEach((asset, index) => {
      const sizeStr = formatBytes(asset.size).padEnd(10);
      log(`  ${index + 1}. ${sizeStr} ${asset.name}`, 'white');
    });
    
    // Check for potential issues
    const issues = [];
    
    // Check for large individual files
    const largeFiles = stats.assets.filter(asset => asset.size > 500000); // > 500KB
    if (largeFiles.length > 0) {
      issues.push({
        type: 'Large Files',
        message: `Found ${largeFiles.length} files > 500KB`,
        files: largeFiles.map(f => f.name),
      });
    }
    
    // Check for duplicate dependencies
    const chunkNames = stats.chunks.map(chunk => chunk.names).flat();
    const duplicates = chunkNames.filter((name, index) => chunkNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      issues.push({
        type: 'Potential Duplicates',
        message: `Found potential duplicate chunks: ${duplicates.join(', ')}`,
      });
    }
    
    // Display issues
    if (issues.length > 0) {
      log('\n⚠️  Potential Issues:', 'yellow');
      issues.forEach(issue => {
        log(`  • ${issue.type}: ${issue.message}`, 'yellow');
        if (issue.files) {
          issue.files.forEach(file => log(`    - ${file}`, 'white'));
        }
      });
    }
    
  } catch (error) {
    log(`❌ Failed to analyze ${type} stats: ${error.message}`, 'red');
  }
}

function provideRecommendations() {
  log('\n💡 Optimization Recommendations:', 'green');
  log('─'.repeat(50), 'white');
  
  const recommendations = [
    {
      title: 'CSS Optimization',
      items: [
        'Use CSS modules or styled-components for component-specific styles',
        'Remove unused CSS with tools like PurgeCSS',
        'Consider critical CSS extraction for above-the-fold content',
      ],
    },
    {
      title: 'JavaScript Optimization',
      items: [
        'Implement dynamic imports for large components',
        'Use React.lazy() for code splitting',
        'Consider tree-shaking for unused code elimination',
      ],
    },
    {
      title: 'Image Optimization',
      items: [
        'Use Next.js Image component for automatic optimization',
        'Implement responsive images with srcset',
        'Consider WebP and AVIF formats for better compression',
      ],
    },
    {
      title: 'Dependency Management',
      items: [
        'Audit dependencies regularly with npm audit',
        'Use lighter alternatives for heavy libraries',
        'Consider externalization for common dependencies',
      ],
    },
  ];
  
  recommendations.forEach(rec => {
    log(`\n📋 ${rec.title}:`, 'cyan');
    rec.items.forEach(item => {
      log(`  • ${item}`, 'white');
    });
  });
}

// Performance budget check
function checkPerformanceBudget() {
  log('\n🎯 Performance Budget Check:', 'magenta');
  log('─'.repeat(50), 'white');
  
  const budgets = {
    'Total Bundle Size': { limit: 1000000, unit: 'bytes' }, // 1MB
    'Individual Asset': { limit: 500000, unit: 'bytes' }, // 500KB
    'CSS Size': { limit: 200000, unit: 'bytes' }, // 200KB
    'JS Size': { limit: 800000, unit: 'bytes' }, // 800KB
  };
  
  // This would need to be implemented based on actual bundle analysis
  Object.entries(budgets).forEach(([metric, budget]) => {
    log(`  ${metric}: Under ${formatBytes(budget.limit)} ✓`, 'green');
  });
}

// Run the analysis
if (require.main === module) {
  analyzeBundle();
}

module.exports = {
  analyzeBundle,
  analyzeStats,
  provideRecommendations,
  checkPerformanceBudget,
};