const pool = require('../db');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create test users
    const usersResult = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at)
      VALUES 
        ('customer@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36FhQEta', 'John', 'Customer', '+1234567890', 'customer', true, NOW(), NOW()),
        ('driver@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36FhQEta', 'Jane', 'Driver', '+0987654321', 'driver', true, NOW(), NOW()),
        ('admin@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36FhQEta', 'Admin', 'User', '+5555555555', 'admin', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `);

    console.log(`✅ Created ${usersResult.rows.length} users`);

    // Get user IDs
    const users = await pool.query('SELECT id, role FROM users WHERE email IN ($1, $2, $3)', 
      ['customer@test.com', 'driver@test.com', 'admin@test.com']);
    
    const customerId = users.rows.find(u => u.role === 'customer').id;
    const driverId = users.rows.find(u => u.role === 'driver').id;

    // Create test vehicles
    const vehiclesResult = await pool.query(`
      INSERT INTO vehicles (registration_number, vehicle_type, capacity_weight, capacity_volume, driver_id, status, created_at, updated_at)
      VALUES 
        ('TRK-001', 'truck', 2000, 50, $1, 'active', NOW(), NOW()),
        ('VAN-001', 'van', 1000, 25, $1, 'active', NOW(), NOW()),
        ('BIKE-001', 'bike', 100, 2, NULL, 'active', NOW(), NOW())
      ON CONFLICT (registration_number) DO NOTHING
      RETURNING id;
    `, [driverId]);

    console.log(`✅ Created ${vehiclesResult.rows.length} vehicles`);

    // Create test shipments
    const shipmentStatuses = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const shipmentTypes = ['standard', 'express', 'fragile', 'hazmat'];
    const priorities = ['standard', 'high', 'urgent'];

    for (let i = 0; i < 15; i++) {
      const tracking_number = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];
      const shipment_type = shipmentTypes[Math.floor(Math.random() * shipmentTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const shipmentResult = await pool.query(`
        INSERT INTO shipments (
          tracking_number, sender_id, receiver_name, receiver_email, receiver_phone,
          receiver_address, receiver_city, receiver_state, receiver_zipcode, receiver_country,
          origin_address, destination_address, weight, dimensions, contents_description,
          shipment_type, status, priority, estimated_delivery_date, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
        RETURNING id;
      `, [
        tracking_number, customerId, 
        `Recipient ${i}`, `recipient${i}@test.com`, `+123456789${i}`,
        `${100 + i} Delivery St`, 'New York', 'NY', '10001', 'USA',
        '456 Warehouse Ave', `${100 + i} Delivery St`, 
        Math.random() * 100, `${30 + i}x${20}x${10}`, 'Test Package Contents',
        shipment_type, status, priority,
        new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ]);

      // Add status history
      const shipmentId = shipmentResult.rows[0].id;
      await pool.query(`
        INSERT INTO shipment_status_history (shipment_id, status, location, latitude, longitude, notes, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW());
      `, [
        shipmentId, status, 
        `Location ${i}`,
        40.7128 + (Math.random() - 0.5) * 0.1,
        -74.0060 + (Math.random() - 0.5) * 0.1,
        'Sample status update',
        customerId
      ]);
    }

    console.log(`✅ Created 15 shipments`);

    // Create test routes
    const vehicleIds = vehiclesResult.rows.slice(0, 2).map(v => v.id);
    for (let i = 0; i < 3; i++) {
      const route_code = `ROUTE-${Date.now()}-${i}`;
      await pool.query(`
        INSERT INTO routes (route_code, vehicle_id, driver_id, origin_location, destination_location, distance_km, estimated_duration_hours, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW());
      `, [
        route_code, 
        vehicleIds[i % vehicleIds.length],
        driverId,
        `Warehouse ${i}`, 
        `Distribution Center ${i}`,
        50 + i * 10,
        2 + i,
        ['planned', 'in_progress', 'completed'][i % 3]
      ]);
    }

    console.log(`✅ Created 3 routes`);

    // Create GPS locations
    const vehicleIds2 = vehiclesResult.rows.slice(0, 2);
    for (let i = 0; i < 10; i++) {
      await pool.query(`
        INSERT INTO gps_locations (vehicle_id, latitude, longitude, speed, heading, accuracy, recorded_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '1 minute' * $7, NOW());
      `, [
        vehicleIds2[i % vehicleIds2.length].id,
        40.7128 + (Math.random() - 0.5) * 0.05,
        -74.0060 + (Math.random() - 0.5) * 0.05,
        Math.random() * 80,
        Math.floor(Math.random() * 360),
        Math.random() * 10,
        i
      ]);
    }

    console.log(`✅ Created 10 GPS locations`);

    // Create notifications
    const shipments = await pool.query('SELECT id FROM shipments LIMIT 5');
    for (const shipment of shipments.rows) {
      await pool.query(`
        INSERT INTO notifications (user_id, shipment_id, type, title, message, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW());
      `, [
        customerId,
        shipment.id,
        'status_update',
        'Shipment Status Updated',
        'Your shipment has been updated',
        false
      ]);
    }

    console.log(`✅ Created notifications`);

    console.log('✨ Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Customer: customer@test.com (password: password)');
    console.log('  Driver: driver@test.com (password: password)');
    console.log('  Admin: admin@test.com (password: password)');

  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
