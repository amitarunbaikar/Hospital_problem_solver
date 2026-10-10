/* Start-up: seed if empty, then render */
if(!db||!db.beds)db=seed();ensureAddons();render();
