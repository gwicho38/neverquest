- please always check for coherence and equality between production and dev data and identify when there is a data mismatch
- when done 2. The Problem: Physics overlap callbacks run every frame, so any state management in
  them will continuously overwrite other systems' changes 3. The Solution:
    - Overlap callbacks should only manage UI visibility
    - Let each system (dialog, battle, etc.) manage its own player state flags
    - State changes should happen at transition points, not continuously
    4. The Specific Bug: The overlap callback was disabling canAtack every frame when
       dialog was closed, preventing attacks after closing dialogs
    5. Best Practices:
    - Overlap callbacks = UI only
    - Each system owns its state changes
    - Avoid frame-by-frame state changes
    - Log state transitions (not every frame)
    - Consider event-driven architecture
    6. File References: Documents exactly where this issue occurred and the related files

    This document will help prevent similar issues in the future when:
    - Adding new interaction systems (shops, crafting, etc.)
    - Creating new UI overlays that need to disable controls
    - Debugging player control issues
    - Onboarding new developers to the codebase
