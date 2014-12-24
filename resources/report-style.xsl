<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="text" indent="yes" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" />

<xsl:template match="testResults">
	  ---called main--
	   <xsl:call-template name="distinct" />
</xsl:template>
<xsl:template name="distinct">
	----- in the apply templates ---
	<xsl:for-each select="/testResults/*[not(@lb = preceding::*/@lb)]">
			--------- start --------
			<xsl:variable name="label" select="@lb" />
			<xsl:variable name="count" select="count(../*[@lb = current()/@lb])" />
			<xsl:variable name="failureCount" select="count(../*[@lb = current()/@lb][attribute::s='false'])" />
			<xsl:variable name="successCount" select="count(../*[@lb = current()/@lb][attribute::s='true'])" />
			<xsl:variable name="successPercent" select="$successCount div $count" />
			<xsl:variable name="totalTime" select="sum(../*[@lb = current()/@lb]/@t)" />
			<xsl:variable name="averageTime" select="$totalTime div $count" />
			
			 <xsl:for-each select="../*[@lb = $label and @tn != $label]">			         			            
	          ---------
	          	  tx: <xsl:value-of select="@lb" />
	              tx: <xsl:value-of select="@tn" />
	              position:  <xsl:value-of select="position()" />
	              time:  <xsl:value-of select="@t" />
	              bytes: <xsl:value-of select="@by" />
	              s: <xsl:value-of select="@s" />
	          ---------
	         </xsl:for-each>
	</xsl:for-each>		
</xsl:template>
</xsl:stylesheet>