# Terminology Notes

## In Values

### "Module"

App modules are services. May change to "Service".

### "Info[rmation]"

A table that's not a class, has no behavior, and is just data or state. EditorInfo, TabInfo, DocumentInfo. May change to "Data" sometime in the future because "Info" might sound unnatural.

### "Context"

A unique object that contains API. EditorContext, TabContext.

### "Kind" or "Type"

An arbitrary string value to identify the kind/type of an object. FileIcon.kind, EditorInfo.kind.

### "Hook"

Chained functions that are called when a hookable event fires. 

Before closing, the app runs through hooks in order. The hooks can call cancel() to prevent closing.

## In Methods

### "Try"

Methods that might not succeed at what it should do if it didn't start with "try-". Failing is anticipated. It can return a boolean, return an optional value or just handle the error internally (like logging or making a popup appear). 

### "Make" or "Create"

Usually private methods that generate some value. It should mostly be for DRY.

### "Set"

When used internally, setters are wrappers for setting a value and directly firing an event. 

### "Update"

Update methods are usually internal. They read the new data and update, for example, the DOM based on the said data. They can be called inside a setter or in a listener. They should not fire events. FileTree.updateTree().

### "Get"

Using a getter method is preferred over directly accessing a property.

### "Bind"

In modules, they are methods that couple its module to other modules in the app. It should be used when the module constructor becomes too long.

### "Init[ialize]"

In the App class and modules, think of "init" methods as "constructors that can be asynchronous".

### "Start"

A "start" method can be called once all dependencies are initialized/ready. App.start().





















