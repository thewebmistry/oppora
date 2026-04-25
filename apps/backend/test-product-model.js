// Quick test to verify Product model can be instantiated
const mongoose = require('mongoose');

// Mock connection
mongoose.connect('mongodb://localhost:27017/test_db', { useNewUrlParser: true, useUnifiedTopology: true });

// Import models
const { Company } = require('./dist/models/Company');
const { Product } = require('./dist/models/Product');

async function testProductModel() {
  try {
    console.log('🧪 Testing Product Model...\n');

    // Test 1: Create a test company first
    const companyData = {
      companyName: 'Test Product Company',
      slug: 'test-product-company',
      category: 'ecommerce',
      status: 'active',
      scores: {
        overallRating: 85,
        trustScore: 90,
        growthTrend: 10,
        riskLevel: 2
      }
    };
    
    const testCompany = new Company(companyData);
    console.log('✅ Test Company created for Product testing');
    console.log('Company ID:', testCompany._id);
    
    // Test 2: Product model instantiation
    const productData = {
      productName: 'Premium Starter Kit',
      companyRef: testCompany._id,
      price: 199.99,
      category: 'StarterKit',
      imageUrl: 'https://example.com/product.jpg',
      description: 'A premium starter kit for new users',
      status: 'active'
    };
    
    const product = new Product(productData);
    console.log('\n✅ Product model instantiated successfully');
    console.log('Product fields:', Object.keys(product.toObject()));
    
    // Test 3: Validate required fields
    console.log('\n📋 Product Schema Validation:');
    console.log('- productName:', product.productName);
    console.log('- companyRef:', product.companyRef);
    console.log('- price:', product.price);
    console.log('- category:', product.category);
    console.log('- status:', product.status);
    console.log('- createdAt:', product.createdAt);
    console.log('- updatedAt:', product.updatedAt);
    
    // Test 4: Test validation
    try {
      await product.validate();
      console.log('\n✅ Product validation passed');
    } catch (validationError) {
      console.log('\n❌ Product validation failed:', validationError.message);
    }
    
    // Test 5: Test duplicate product name validation (within same company)
    const duplicateProduct = new Product({
      ...productData,
      _id: new mongoose.Types.ObjectId() // Different ID
    });
    
    try {
      await duplicateProduct.validate();
      console.log('\n⚠️  Duplicate product validation (should fail on save due to unique index)');
    } catch (error) {
      console.log('\n✅ Duplicate detection working:', error.message);
    }
    
    console.log('\n🧪 Product Model Test Completed Successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during Product model test:', error.message);
    console.error(error);
  } finally {
    // Close connection
    mongoose.connection.close();
  }
}

// Run test
testProductModel().catch(console.error);