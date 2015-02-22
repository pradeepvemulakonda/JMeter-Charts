<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="text" indent="yes" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" />

<!-- match the testResults and call the template build-json-->
<xsl:template match="testResults">
	   {
	   		"name":"sampleData",
	   		"samples":[
	   			<xsl:call-template name="build-json" />
	   		]
	   }
</xsl:template>

<xsl:template name="build-json">
	<xsl:for-each select="/testResults/*[not(@lb = preceding::*/@lb)]">
		<!--Setup some variable to be used in creating the chart data-->
					"name": "<xsl:value-of select="$label"/>"
			}<xsl:if test="not(position()=last())">,</xsl:if>
	</xsl:for-each>
</xsl:template>
</xsl:stylesheet>