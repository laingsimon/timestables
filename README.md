# [Times tables](https://timestablesapp.azureedge.net)

I have a young family and one of the week-on-week homework tasks is times tables. Our school has a subscription to an app which can run on a modern tablet or phone. Which is great, but with all the high end graphics it doesn't perform so well as the device matures.

I, and I'm sure other families, don't have the disposable income to afford a new tablet to keep up with the demands of these ever increasingly space and power hungry apps. I mean it's testing pupils knowledge of times tables, that can't be that difficult for an app to do!

Well, as someone once said, [I have a particular set of skills](https://www.rottentomatoes.com/m/taken/quotes/#:~:text=If%20you%20are%20looking%20for,be%20the%20end%20of%20it.), and I thought I'd put them to use. But I wanted to make something that would fullfil the following conditions:

- be free to use. Always. No ads.
- be light weight, and survive the test of time
- be safe and secure for use by young children

Let's explain them off quickly...

### Free to use. Always. No ads.
I'm not creating this to make money, I'm here to make the timestables for children and their parents more accessible and enjoyable - if possible.

If anyone else benefits from it, great. But I'm not going to charge anyone for the service. I'm not going to load it with ads to provide any kick backs. Free, full stop.

This naturally means that I need to make sure it doesn't cost me anything material. If that continues to be the case then I'll keep the service alive. However I'll have to review it if it is abused.

The product is licensed under the Apache 2. There should be no copying of this software for redistribution and certainly not any monetary gain. If you've been charged or presented with ads, you've come across an unlicensed copy, and nothing of my doing.

### Light weight, and survive the test of time
I want this service to support people now. Next year, next decade, if anyone sees the use for it. I've made an assumption that the technology of the future will not look too different from what we have today, i.e. handheld tech will still be a thing and that tech will support a web page.

That's it. If you can [open a web page](https://timestablesapp.azureedge.net), you can use the app. No installation required. No high end device requirements and no space requirements. As such, there can be one version to work in iOS, Android, Windows and anywhere else you can think of.

### Safe and secure for use by young children
Finally. But probably the most important. Children will be in front of the service, as such everything must be secure, safe and appropriate. No personal data should be requested, stored on the browser and certainly not transmitted over the internet.

The service should be entirely client-only, there should be no server component to support this verification.

## Implementation
I thought about the means of implementing this service and considered that it could be a showcase of my capabilities, using React or some other 'clever' technologies. It could have made things simpler, but equally would have complicated matters.

Ultimately I want a service that is easy to create and maintain. Also, only requiring client side capabilities. Compiling less or sass to CSS - for example - only complicates the development and release process.

As such I've opted for very basic technologies, jQuery and ... nothing else.

I'm sure people will review the opportunity and say that this tech or that could have helped. In a production ready, performance critical or otherwise enterprise application I'd agree completely. But that's not the purpose of this service.

As such the service is a set of static files served from a CDN directly. Some minification might be applied to reduce costs but otherwise they will be the files in GitHub.
