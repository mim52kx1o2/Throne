/*
importClass(java.io.File);
importClass(org.xml.sax.InputSource);
importClass(java.io.FileInputStream);
importClass(java.io.FileOutputStream);
importClass(javax.xml.xpath.XPathFactory);
importClass(javax.xml.xpath.XPathConstants);
importClass(java.util.HashMap);
importClass(javax.xml.namespace.NamespaceContext);
importClass(org.apache.tools.ant.BuildException);
importClass(org.apache.tools.ant.Target);
importClass(org.apache.tools.ant.Location);
importClass(org.apache.tools.ant.types.FileSet);
importClass(org.apache.tools.ant.types.DirSet);
importClass(java.beans.Introspector);
importClass(org.apache.tools.ant.types.Mapper);
importClass(org.apache.tools.ant.types.resources.PropertyResource);
importClass(org.apache.tools.ant.types.resources.FileResource);
importClass(org.w3c.dom.Text);
importClass(org.w3c.dom.Element);
importClass(org.w3c.dom.NodeList);
importClass(java.util.Properties);
importClass(java.lang.RuntimeException);
*/

var is = null;
var stagingPath = self.project.getProperty('adf.build.root.dir');
if (stagingPath === null)
{
	  throw new java.lang.RuntimeException("Staging path not found ${adf.build.root.dir}");
}

try
{
	var namespaces = new javax.xml.namespace.NamespaceContext({
			   getNamespaceURI: function(prefix) {return "http://xmlns.oracle.com/adf/mf"; },
			   getPrefix: function(uri){return "adfmf";},
			   getPrefixes: function(uri){return null;}});
	var xpath = javax.xml.xpath.XPathFactory.newInstance().newXPath();
	xpath.setNamespaceContext(namespaces);
	
	var file = new java.io.File(stagingPath+'/.adf/META-INF/maf-application.xml');

	is = new java.io.FileInputStream(file);

	var nodes = xpath.evaluate("/adfmf:application/adfmf:deviceFeatureAccess", new org.xml.sax.InputSource(is),
	        javax.xml.xpath.XPathConstants.NODESET);

    var properties = new java.util.Properties();

    if (nodes instanceof org.w3c.dom.NodeList) {
        // should only be one, ignore others
        var item = nodes.item(0);
        if (item instanceof org.w3c.dom.Element) {
            var childNodes = item.getChildNodes();
            var first = true;

            for (var i = 0; i < childNodes.getLength(); i++) {
                var accessPermission = childNodes.item(i);
                if (accessPermission instanceof org.w3c.dom.Element
                        && "true".equals(accessPermission.getAttribute("access"))) {
                    var name = accessPermission.getLocalName();
                    if (name == null) {
                        name =  accessPermission.getTagName();
                    }
                    
                    if ("deviceCamera".equals(name)) {
                        properties.put("oepe.maf.device.access.camera", "true");
                    } else if ("deviceContacts".equals(name)) {
                        properties.put("oepe.maf.device.access.contacts", "true");
                    } else if ("deviceEmails".equals(name)) {
                        properties.put("oepe.maf.device.access.emails", "true");
                    } else if ("deviceFiles".equals(name)) {
                        properties.put("oepe.maf.device.access.files", "true");
                    } else if ("deviceLocation".equals(name)) {
                        properties.put("oepe.maf.device.access.location", "true");
                    } else if ("deviceNetwork".equals(name)) {
                        properties.put("oepe.maf.device.access.network", "true");
                    } else if ("devicePhone".equals(name)) {
                        properties.put("oepe.maf.device.access.phone", "true");
                    } else if ("devicePushNotifications".equals(name)) {
                        properties.put("oepe.maf.device.access.pushnotifications", "true");
                    } else if ("deviceSMS".equals(name)) {
                        properties.put("oepe.maf.device.access.sms", "true");
                    }
                }
            }
        }
    }
    properties.store(new java.io.FileOutputStream(new java.io.File(stagingPath+"/device-access.properties")), "This file is automatically generated by the OEPE build system.  Do not modify");
}
finally
{
	if (is != null)
	{
		try {is.close();} catch (e2) {}
	}
}